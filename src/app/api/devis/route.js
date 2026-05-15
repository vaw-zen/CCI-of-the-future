import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import {
  buildAttributionColumns,
  buildLeadMeasurementParams,
  extractAnalyticsContext,
  sendLifecycleMeasurementEvent
} from '@/libs/analyticsLifecycle';
import { persistServerTerminalBehaviorEvent } from '@/libs/behaviorTrackingServer.mjs';
import {
  buildWhatsAppAttributionColumns,
  findLatestWhatsAppClickMatch
} from '@/libs/whatsappAttribution.mjs';
import {
  getDefaultFollowUpSlaAt,
  LEAD_QUALITY_OUTCOMES,
  LEAD_STATUSES
} from '@/utils/leadLifecycle';
import {
  isMissingOptionalLeadOperationFieldError,
  withoutOptionalLeadOperationFields
} from '@/libs/leadTrackingSchemaCompat.mjs';
import { guardMutationRequest } from '@/libs/security';
import { isStage3TestSubmission, STAGE3_TEST_MARKER } from '@/libs/stage3TestMarker.mjs';

const DEVIS_RATE_LIMIT = {
  scope: 'devis-submit',
  limit: 20,
  windowMs: 10 * 60 * 1000
};

function buildStage3TestBehaviorPayload(isStage3Test = false, additionalPayload = {}) {
  return {
    ...additionalPayload,
    stage3_test: isStage3Test || undefined,
    test_marker: isStage3Test ? STAGE3_TEST_MARKER : undefined
  };
}

async function sendDevisFailureMeasurement(analyticsContext, failureType, serviceType = '') {
  return sendLifecycleMeasurementEvent({
    clientId: analyticsContext.ga_client_id,
    eventName: failureType === 'validation_failed' ? 'form_validation_failed' : 'form_submit_failed',
    eventParams: {
      form_name: 'devis_form',
      form_placement: 'devis_page',
      funnel_name: 'quote_request',
      failure_type: failureType,
      lead_type: 'quote_request',
      business_line: 'b2c',
      service_type: serviceType || undefined,
      session_source: analyticsContext.session_source,
      session_medium: analyticsContext.session_medium,
      session_campaign: analyticsContext.session_campaign,
      landing_page: analyticsContext.landing_page
    }
  });
}

async function persistDevisTerminalBehaviorEvent({
  supabase,
  analyticsContext,
  rawEventName,
  serviceType = '',
  occurredAt = new Date().toISOString(),
  isStage3Test = false,
  additionalPayload = {}
} = {}) {
  return persistServerTerminalBehaviorEvent({
    supabase,
    rawEventName,
    analyticsContext,
    formName: 'devis_form',
    formPlacement: 'devis_page',
    funnelName: 'quote_request',
    businessLine: 'b2c',
    serviceType,
    leadType: 'quote_request',
    occurredAt,
    additionalPayload: buildStage3TestBehaviorPayload(isStage3Test, additionalPayload)
  });
}

export async function POST(request) {
  const guardResponse = guardMutationRequest(request, DEVIS_RATE_LIMIT);
  if (guardResponse) {
    return guardResponse;
  }

  let analyticsContext = {};
  let requestedServiceType = '';
  let isStage3Test = false;

  try {
    let supabase;
    try {
      supabase = createServiceClient();
    } catch (error) {
      return NextResponse.json({ 
        status: 'config_error', 
        message: 'Service de base de données non configuré.',
        data: null,
        details: { failureType: 'config_error' }
      }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    analyticsContext = extractAnalyticsContext(body?.analyticsContext || {}, { request });
    const formData = body?.formData || body || {};
    const attributionColumns = buildAttributionColumns(analyticsContext);

    // Honeypot check — bots fill this hidden field, real users never see it
    if (formData.honeypotWebsite) {
      return NextResponse.json({
        status: 'success',
        message: 'Votre demande de devis a été envoyée avec succès !',
        data: { id: 'ok' },
        details: { devisConfirmed: true, devisSaved: true }
      });
    }

    // Extract and validate required fields
    const {
      nom, prenom, email, telephone, adresse, ville,
      typeService, newsletter, conditions
    } = formData;
    requestedServiceType = typeService || '';
    isStage3Test = isStage3TestSubmission(nom, prenom, email, formData.message);

    // Basic validation
    if (!nom || !prenom || !email || !telephone || !adresse || !ville || !typeService) {
      await sendDevisFailureMeasurement(analyticsContext, 'validation_failed', typeService);
      await persistDevisTerminalBehaviorEvent({
        supabase,
        analyticsContext,
        rawEventName: 'form_validation_failed',
        serviceType: typeService,
        isStage3Test,
        additionalPayload: {
          failure_type: 'validation_failed'
        }
      });
      return NextResponse.json({ 
        status: 'validation_failed', 
        message: 'Tous les champs obligatoires doivent être remplis.',
        data: null,
        details: { failureType: 'validation_failed' }
      }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await sendDevisFailureMeasurement(analyticsContext, 'validation_failed', typeService);
      await persistDevisTerminalBehaviorEvent({
        supabase,
        analyticsContext,
        rawEventName: 'form_validation_failed',
        serviceType: typeService,
        isStage3Test,
        additionalPayload: {
          failure_type: 'validation_failed'
        }
      });
      return NextResponse.json({ 
        status: 'validation_failed', 
        message: 'Veuillez fournir une adresse email valide.',
        data: null,
        details: { failureType: 'validation_failed' }
      }, { status: 400 });
    }

    if (!conditions) {
      await sendDevisFailureMeasurement(analyticsContext, 'validation_failed', typeService);
      await persistDevisTerminalBehaviorEvent({
        supabase,
        analyticsContext,
        rawEventName: 'form_validation_failed',
        serviceType: typeService,
        isStage3Test,
        additionalPayload: {
          failure_type: 'validation_failed'
        }
      });
      return NextResponse.json({ 
        status: 'validation_failed', 
        message: 'Vous devez accepter les conditions générales.',
        data: null,
        details: { failureType: 'validation_failed' }
      }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();
    const matchedWhatsAppClick = await findLatestWhatsAppClickMatch(supabase, {
      gaClientId: analyticsContext.ga_client_id,
      beforeIso: submittedAt
    });
    const whatsappAttributionColumns = buildWhatsAppAttributionColumns(matchedWhatsAppClick);

    // Transform form data to match Supabase schema
    const devisData = {
      // Personal Information
      type_personne: formData.typePersonne || 'physique',
      matricule_fiscale: formData.matriculeFiscale || null,
      nom: nom,
      prenom: prenom,
      email: email,
      telephone: telephone,
      
      // Address Information
      adresse: adresse,
      ville: ville,
      code_postal: formData.codePostal || null,
      type_logement: formData.typeLogement || null,
      surface: formData.surface ? parseInt(formData.surface) : null,
      
      // Service Information
      type_service: typeService,
      nombre_places: formData.nombrePlaces ? parseInt(formData.nombrePlaces) : null,
      surface_service: formData.surfaceService ? parseFloat(formData.surfaceService) : null,
      
      // Appointment Preferences
      date_preferee: formData.datePreferee || null,
      heure_preferee: formData.heurePreferee || null,
      
      // Additional Information
      message: formData.message || null,
      newsletter: newsletter || false,
      conditions: conditions,

      // Lifecycle and attribution
      lead_status: LEAD_STATUSES.SUBMITTED,
      lead_quality_outcome: LEAD_QUALITY_OUTCOMES.UNREVIEWED,
      submitted_at: submittedAt,
      follow_up_sla_at: getDefaultFollowUpSlaAt(submittedAt),
      last_worked_at: submittedAt,
      ...attributionColumns,
      ...whatsappAttributionColumns
    };

    // Save to Supabase first
    let { data: supabaseData, error: supabaseError } = await supabase
      .from('devis_requests')
      .insert([devisData])
      .select()
      .single();

    if (supabaseError && isMissingOptionalLeadOperationFieldError(supabaseError)) {
      console.warn('[devis] retrying insert without optional lead-operations columns:', supabaseError.message);
      ({ data: supabaseData, error: supabaseError } = await supabase
        .from('devis_requests')
        .insert([withoutOptionalLeadOperationFields(devisData)])
        .select()
        .single());
    }

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      await sendDevisFailureMeasurement(analyticsContext, 'database_error', typeService);
      await persistDevisTerminalBehaviorEvent({
        supabase,
        analyticsContext,
        rawEventName: 'form_submit_failed',
        serviceType: typeService,
        occurredAt: submittedAt,
        isStage3Test,
        additionalPayload: {
          failure_type: 'database_error'
        }
      });
      return NextResponse.json({ 
        status: 'database_error', 
        message: 'Erreur lors de l\'enregistrement de votre demande. Veuillez réessayer.',
        data: null,
        details: { failureType: 'database_error' }
      }, { status: 500 });
    }

    await persistDevisTerminalBehaviorEvent({
      supabase,
      analyticsContext,
      rawEventName: 'checkout_progress',
      serviceType: typeService,
      occurredAt: submittedAt,
      isStage3Test,
      additionalPayload: {
        lead_id: supabaseData.id,
        lead_kind: 'devis',
        step_name: 'submit_success',
        step_number: 3
      }
    });

    await sendLifecycleMeasurementEvent({
      clientId: analyticsContext.ga_client_id,
      eventName: 'lead_submitted',
      eventParams: buildLeadMeasurementParams({
        leadRecord: supabaseData,
        leadType: 'devis',
        businessLine: 'b2c'
      })
    });

    let emailSent = false;
    let emailError = null;

    try {
      // Email delivery is non-blocking after the lead has been saved.
      if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        throw new Error('GMAIL_USER or GMAIL_PASS not configured');
      }

      const { default: nodemailer } = await import('nodemailer');

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      await transporter.verify();

      const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
      const adminRecipient = 'chaaben.fares94@gmail.com';

    const colors = {
      bgBase: '#141416',
      bgElevated: 'rgb(26, 26, 28)',
      accent: 'rgb(203, 251, 66)',
      textPrimary: '#FFFFFF',
      textSecondary: '#FFFFFF99',
      textDark: '#111111',
      textBody: '#333333',
      textMuted: '#666666',
      white: '#ffffff',
      success: '#d4edda',
      successBorder: '#c3e6cb',
      successText: '#155724',
    };

    // Service type mapping for display
    const serviceTypes = {
      salon: 'Nettoyage de salon (canapés, fauteuils)',
      tapis: 'Nettoyage de tapis/moquettes',
      tapisserie: 'Tapisserie (confection, restauration)',
      marbre: 'Polissage de marbre',
      tfc: 'Nettoyage TFC (bureaux, commerces)'
    };

    const serviceDisplay = serviceTypes[typeService] || typeService;

    // Admin notification email
    const adminMail = {
      from: `"CCI Devis" <${process.env.GMAIL_USER}>`,
      to: adminRecipient,
      subject: `🏠 Nouvelle demande de DEVIS — ${nom} ${prenom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <div style="background:${colors.bgBase}; color:${colors.textPrimary}; padding: 16px 20px;">
            <h1 style="margin:0; font-size:20px;">
              <span style="color:${colors.accent};">🏠 Nouvelle demande de DEVIS</span>
            </h1>
            <p style="margin:4px 0 0; font-size:12px; color:${colors.textSecondary};">Reçue le ${now}</p>
            <p style="margin:8px 0 0; font-size:14px; color:${colors.accent}; font-weight:600;">⚡ PRIORITÉ: Demande de devis</p>
          </div>
          <div style="padding: 20px;">
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding:8px; font-weight:600; width:160px; color:${colors.textDark};">Nom</td><td style="padding:8px; color:${colors.textBody};">${nom} ${prenom}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Email</td><td style="padding:8px; color:${colors.textBody};"><a href="mailto:${email}" style="color:${colors.textDark}; text-decoration:none;">${email}</a></td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Téléphone</td><td style="padding:8px; color:${colors.textBody};">${telephone}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Adresse</td><td style="padding:8px; color:${colors.textBody};">${adresse}, ${ville}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Service demandé</td><td style="padding:8px; color:${colors.textBody};">${serviceDisplay}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Newsletter</td><td style="padding:8px; color:${colors.textBody};">${newsletter ? '✅ Oui' : '❌ Non'}</td></tr>
            </table>
            ${formData.message ? `
              <div style="margin-top:16px; padding:12px; background:#f8f9fa; border-left:4px solid ${colors.accent};">
                <div style="font-weight:600; margin-bottom:8px; color:${colors.textDark};">Détails supplémentaires</div>
                <div style="color:${colors.textBody}; white-space: pre-line;">${formData.message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
              </div>
            ` : ''}
            <div style="margin-top:16px; padding:12px; background:#fff3cd; border:1px solid #ffeaa7; border-radius:6px;">
              <div style="font-weight:600; color:#856404; margin-bottom:4px;">📋 Action requise</div>
              <div style="color:#856404; font-size:13px;">Cette demande de devis nécessite un suivi rapide. Contactez le client dans les 24h.</div>
            </div>
          </div>
          <div style="text-align:center; font-size:12px; color:${colors.textMuted}; padding: 12px 0 20px;">
            <span style="display:inline-block; height:8px; width:8px; background:${colors.accent}; border-radius:50%; margin-right:6px;"></span>
            CCI Devis — Notification automatique
          </div>
        </div>
      `,
      replyTo: email,
    };

    // User confirmation email
    const userMail = {
      from: `"CCI Services" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🏠 Votre demande de devis a été reçue - Confirmation CCI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${colors.bgBase} 0%, ${colors.bgElevated} 100%); color:${colors.textPrimary}; padding: 30px 20px; text-align: center;">
            <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
              CCI
            </div>
            <h1 style="margin:0; font-size:28px; font-weight: 700;">
              🏠 <span style="color:${colors.accent};">Demande reçue !</span>
            </h1>
            <p style="margin:12px 0 0; font-size:16px; color:${colors.textSecondary};">
              Merci ${prenom}, nous avons bien reçu votre demande de devis
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">
            <div style="margin-bottom:24px; padding:20px; background:${colors.success}; border:1px solid ${colors.successBorder}; border-radius:8px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
              <div style="font-weight:600; color:${colors.successText}; font-size: 18px; margin-bottom:8px;">Demande de devis confirmée</div>
              <div style="color:${colors.successText}; font-size:14px;">Nous traiterons votre demande dans les plus brefs délais</div>
            </div>

            <h2 style="color: ${colors.textDark}; font-size: 20px; margin: 0 0 16px 0;">Récapitulatif de votre demande :</h2>
            
            <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark}; border-bottom: 1px solid #eee;">Service</td><td style="padding:8px; color:${colors.textBody}; border-bottom: 1px solid #eee;">${serviceDisplay}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark}; border-bottom: 1px solid #eee;">Adresse</td><td style="padding:8px; color:${colors.textBody}; border-bottom: 1px solid #eee;">${adresse}, ${ville}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark}; border-bottom: 1px solid #eee;">Contact</td><td style="padding:8px; color:${colors.textBody}; border-bottom: 1px solid #eee;">${telephone}</td></tr>
            </table>

            <div style="margin-bottom: 20px;">
              <h3 style="color: ${colors.textDark}; font-size: 16px; margin: 0 0 12px 0;">Prochaines étapes :</h3>
              <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 12px;">
                  1
                </div>
                <div>
                  <div style="font-weight: 600; color: ${colors.textDark};">Appel de confirmation</div>
                  <div style="color: ${colors.textBody}; font-size: 14px;">Notre équipe vous contactera sous 24h pour confirmer les détails</div>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 12px;">
                  2
                </div>
                <div>
                  <div style="font-weight: 600; color: ${colors.textDark};">Rendez-vous d'évaluation</div>
                  <div style="color: ${colors.textBody}; font-size: 14px;">Visite gratuite pour évaluer vos besoins sur site</div>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 12px;">
                  3
                </div>
                <div>
                  <div style="font-weight: 600; color: ${colors.textDark};">Devis détaillé</div>
                  <div style="color: ${colors.textBody}; font-size: 14px;">Proposition personnalisée avec tarifs transparents</div>
                </div>
              </div>
            </div>

            <!-- CTA Section -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <h3 style="margin: 0 0 12px 0; color: ${colors.textDark}; font-size: 18px;">Besoin d'infos maintenant ?</h3>
              <p style="margin: 0 0 16px 0; color: ${colors.textBody}; font-size: 14px;">Notre équipe est à votre disposition</p>
              <a href="tel:+21698557766" style="display: inline-block; background: ${colors.accent}; color: ${colors.textDark}; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; margin-right: 12px;">
                📞 98 55 77 66
              </a>
              <a href="mailto:contact@cciservices.online" style="display: inline-block; background: transparent; color: ${colors.textDark}; padding: 12px 24px; border: 2px solid ${colors.accent}; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                📧 Email
              </a>
            </div>

            ${formData.message ? `
              <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
                <h3 style="color: ${colors.textDark}; font-size: 16px; margin: 0 0 12px 0;">Votre message :</h3>
                <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; color: ${colors.textBody}; font-style: italic;">
                  "${formData.message}"
                </div>
              </div>
            ` : ''}

            <p style="margin:24px 0 0; color:${colors.textMuted}; font-size:12px; text-align: center;">
              Demande envoyée le ${now}
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <div style="margin-bottom: 12px;">
              <strong style="color: ${colors.textDark};">CCI Services</strong>
            </div>
            <div style="font-size: 12px; color: ${colors.textMuted}; line-height: 1.5;">
              📧 contact@cciservices.online<br>
              📞 +216 98 55 77 66<br>
              🌐 www.cciservices.online
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #dee2e6; font-size: 11px; color: ${colors.textMuted};">
              Vous recevez cet email suite à votre demande de devis.<br>
              Questions ? Répondez à cet email ou appelez-nous directement.
            </div>
          </div>
        </div>
      `,
    };

    // Send emails
      await Promise.all([
        transporter.sendMail(adminMail),
        transporter.sendMail(userMail)
      ]);
      emailSent = true;
    } catch (mailError) {
      console.error('[devis] Email sending failed (DB insert succeeded):', mailError?.message || mailError);
      emailError = mailError?.message || 'email_error';
      await sendDevisFailureMeasurement(analyticsContext, 'email_error', typeService);
    }

    // If user opted for newsletter, subscribe them automatically
    let newsletterResult = null;
    if (newsletter) {
      try {
        const newsletterResponse = await fetch(`${request.url.replace('/api/devis', '/api/newsletter')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            acceptedPrivacy: true,
            website: '',
            source: 'devis_form',
            analyticsContext,
          }),
        });
        
        if (newsletterResponse.ok) {
          newsletterResult = { success: true };
        }
      } catch (newsletterError) {
        console.warn('Newsletter subscription failed:', newsletterError);
        // Don't fail the main request if newsletter fails
      }
    }

    return NextResponse.json({
      status: 'success',
      message: emailSent
        ? 'Votre demande de devis a été envoyée avec succès ! Un email de confirmation vous a été envoyé.'
        : 'Votre demande de devis a été enregistrée avec succès ! La notification email sera traitée dès que possible.',
      data: supabaseData,
      details: {
        devisConfirmed: true,
        devisSaved: true,
        devisId: supabaseData.id,
        emailSent,
        ...(emailError && { emailNote: 'Demande enregistrée, notification email en attente.' }),
        newsletterSubscribed: newsletter ? (newsletterResult?.success || false) : false
      },
    });

  } catch (error) {
    console.error('Devis submission error:', error);
    await sendDevisFailureMeasurement(analyticsContext, 'unexpected_error', requestedServiceType);
    await persistDevisTerminalBehaviorEvent({
      analyticsContext,
      rawEventName: 'form_submit_failed',
      serviceType: requestedServiceType,
      isStage3Test,
      additionalPayload: {
        failure_type: 'unexpected_error'
      }
    });
    return NextResponse.json({ 
      status: 'unexpected_error',
      message: 'Erreur lors de l\'envoi de votre demande. Veuillez réessayer.', 
      data: null,
      details: {
        failureType: 'unexpected_error',
        error: error?.message
      }
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
