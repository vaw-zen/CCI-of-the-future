import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import {
  buildAttributionColumns,
  buildLeadMeasurementParams,
  extractAnalyticsContext,
  sendLifecycleMeasurementEvent
} from '@/libs/analyticsLifecycle';
import {
  buildWhatsAppAttributionColumns,
  findLatestWhatsAppClickMatch
} from '@/libs/whatsappAttribution.mjs';
import { LEAD_STATUSES } from '@/utils/leadLifecycle';
import { guardMutationRequest } from '@/libs/security';

const CONVENTIONS_RATE_LIMIT = {
  scope: 'convention-submit',
  limit: 20,
  windowMs: 10 * 60 * 1000
};

async function sendConventionFailureMeasurement(analyticsContext, failureType, servicesCount = 0) {
  return sendLifecycleMeasurementEvent({
    clientId: analyticsContext.ga_client_id,
    eventName: 'form_submit_failed',
    eventParams: {
      form_name: 'convention_request',
      failure_type: failureType,
      lead_type: 'convention_request',
      business_line: 'b2b',
      services_count: servicesCount || undefined,
      session_source: analyticsContext.session_source,
      session_medium: analyticsContext.session_medium,
      session_campaign: analyticsContext.session_campaign,
      landing_page: analyticsContext.landing_page
    }
  });
}

export async function POST(request) {
  const guardResponse = guardMutationRequest(request, CONVENTIONS_RATE_LIMIT);
  if (guardResponse) {
    return guardResponse;
  }

  let analyticsContext = {};
  let requestedServices = [];

  try {
    let supabase;
    try {
      supabase = createServiceClient();
    } catch (error) {
      console.error('[conventions] Supabase not configured — missing URL or key');
      return NextResponse.json({
        status: 'config_error',
        message: 'Service de base de données non configuré.',
        data: null,
        details: { failureType: 'config_error' }
      }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    analyticsContext = extractAnalyticsContext(body?.analyticsContext || {});
    const formData = body?.formData || body || {};
    const attributionColumns = buildAttributionColumns(analyticsContext);

    // Honeypot check
    if (formData.honeypotWebsite) {
      return NextResponse.json({
        status: 'success',
        message: 'Votre demande de convention a été envoyée avec succès !',
        data: { id: 'ok' },
        details: { conventionConfirmed: true }
      });
    }

    const {
      raisonSociale, matriculeFiscale, secteurActivite,
      contactNom, contactPrenom, contactFonction,
      email, telephone, nombreSites, surfaceTotale,
      servicesSouhaites, frequence, dureeContrat,
      dateDebutSouhaitee, message, conditions
    } = formData;
    requestedServices = Array.isArray(servicesSouhaites) ? servicesSouhaites : [];

    // Validation
    if (!raisonSociale || !matriculeFiscale || !secteurActivite || !contactNom || !contactPrenom || !email || !telephone || !frequence || !dureeContrat) {
      await sendConventionFailureMeasurement(analyticsContext, 'validation_failed', requestedServices.length);
      return NextResponse.json({
        status: 'validation_failed',
        message: 'Tous les champs obligatoires doivent être remplis.',
        data: null,
        details: { failureType: 'validation_failed' }
      }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await sendConventionFailureMeasurement(analyticsContext, 'validation_failed', requestedServices.length);
      return NextResponse.json({
        status: 'validation_failed',
        message: 'Veuillez fournir une adresse email valide.',
        data: null,
        details: { failureType: 'validation_failed' }
      }, { status: 400 });
    }

    if (!servicesSouhaites || servicesSouhaites.length === 0) {
      await sendConventionFailureMeasurement(analyticsContext, 'validation_failed', requestedServices.length);
      return NextResponse.json({
        status: 'validation_failed',
        message: 'Veuillez sélectionner au moins un service.',
        data: null,
        details: { failureType: 'validation_failed' }
      }, { status: 400 });
    }

    if (!conditions) {
      await sendConventionFailureMeasurement(analyticsContext, 'validation_failed', requestedServices.length);
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

    // Transform data for Supabase
    const conventionData = {
      raison_sociale: raisonSociale,
      matricule_fiscale: matriculeFiscale,
      secteur_activite: secteurActivite,
      contact_nom: contactNom,
      contact_prenom: contactPrenom,
      contact_fonction: contactFonction || null,
      email: email,
      telephone: telephone,
      nombre_sites: nombreSites ? parseInt(nombreSites) : 1,
      surface_totale: surfaceTotale ? parseFloat(surfaceTotale) : null,
      services_souhaites: servicesSouhaites,
      frequence: frequence,
      duree_contrat: dureeContrat,
      date_debut_souhaitee: dateDebutSouhaitee || null,
      message: message || null,
      statut: 'nouveau',
      lead_status: LEAD_STATUSES.SUBMITTED,
      submitted_at: submittedAt,
      ...attributionColumns,
      ...whatsappAttributionColumns
    };

    // Save to Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('convention_requests')
      .insert([conventionData])
      .select()
      .single();

    if (supabaseError) {
      console.error('[conventions] Supabase insert error:', {
        message: supabaseError.message,
        code: supabaseError.code,
        details: supabaseError.details,
        hint: supabaseError.hint
      });
      await sendConventionFailureMeasurement(analyticsContext, 'database_error', requestedServices.length);
      return NextResponse.json({
        status: 'database_error',
        message: 'Erreur lors de l\'enregistrement de votre demande. Veuillez réessayer.',
        data: null,
        details: { failureType: 'database_error' }
      }, { status: 500 });
    }

    await sendLifecycleMeasurementEvent({
      clientId: analyticsContext.ga_client_id,
      eventName: 'lead_submitted',
      eventParams: buildLeadMeasurementParams({
        leadRecord: supabaseData,
        leadType: 'convention',
        businessLine: 'b2b',
        additionalParams: {
          services_count: Array.isArray(supabaseData?.services_souhaites) ? supabaseData.services_souhaites.length : requestedServices.length
        }
      })
    });

    // === Email sending (non-blocking — DB insert already succeeded) ===
    let emailSent = false;
    let emailError = null;

    try {
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

    // Sector display names
    const secteurLabels = {
      banque: 'Banque / Institution financière',
      assurance: 'Compagnie d\'assurances',
      clinique: 'Clinique / Hôpital',
      hotel: 'Hôtel / Résidence',
      bureau: 'Bureau / Espace de coworking',
      commerce: 'Grande surface / Commerce',
      autre: 'Autre'
    };

    const frequenceLabels = {
      quotidien: 'Quotidien',
      '3x_semaine': '3 fois par semaine',
      hebdomadaire: 'Hebdomadaire',
      bi_mensuel: 'Bi-mensuel',
      mensuel: 'Mensuel'
    };

    const dureeLabels = {
      '6_mois': '6 mois',
      '1_an': '1 an',
      '2_ans': '2 ans',
      '3_ans': '3 ans'
    };

    const serviceLabels = {
      locaux: 'Nettoyage des locaux',
      salon: 'Nettoyage salon & mobilier',
      tapis: 'Nettoyage tapis & moquettes',
      marbre: 'Entretien marbre & sols',
      vitres: 'Nettoyage vitres & façades'
    };

    const secteurDisplay = secteurLabels[secteurActivite] || secteurActivite;
    const frequenceDisplay = frequenceLabels[frequence] || frequence;
    const dureeDisplay = dureeLabels[dureeContrat] || dureeContrat;
    const servicesDisplay = servicesSouhaites.map(s => serviceLabels[s] || s).join(', ');

    // Admin notification email
    const adminMail = {
      from: `"CCI Conventions" <${process.env.GMAIL_USER}>`,
      to: adminRecipient,
      subject: `🏢 Nouvelle demande de CONVENTION — ${raisonSociale}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <div style="background:${colors.bgBase}; color:${colors.textPrimary}; padding: 16px 20px;">
            <h1 style="margin:0; font-size:20px;">
              <span style="color:${colors.accent};">🏢 Nouvelle demande de CONVENTION B2B</span>
            </h1>
            <p style="margin:4px 0 0; font-size:12px; color:${colors.textSecondary};">Reçue le ${now}</p>
            <p style="margin:8px 0 0; font-size:14px; color:${colors.accent}; font-weight:600;">⚡ PRIORITÉ HAUTE: Convention entreprise</p>
          </div>
          <div style="padding: 20px;">
            <h3 style="color:${colors.textDark}; border-bottom:2px solid ${colors.accent}; padding-bottom:8px;">Entreprise</h3>
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding:8px; font-weight:600; width:180px; color:${colors.textDark};">Raison sociale</td><td style="padding:8px; color:${colors.textBody};">${raisonSociale}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Matricule fiscale</td><td style="padding:8px; color:${colors.textBody};">${matriculeFiscale}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Secteur</td><td style="padding:8px; color:${colors.textBody};">${secteurDisplay}</td></tr>
            </table>

            <h3 style="color:${colors.textDark}; border-bottom:2px solid ${colors.accent}; padding-bottom:8px; margin-top:16px;">Contact</h3>
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding:8px; font-weight:600; width:180px; color:${colors.textDark};">Nom</td><td style="padding:8px; color:${colors.textBody};">${contactNom} ${contactPrenom}</td></tr>
              ${contactFonction ? `<tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Fonction</td><td style="padding:8px; color:${colors.textBody};">${contactFonction}</td></tr>` : ''}
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Email</td><td style="padding:8px; color:${colors.textBody};"><a href="mailto:${email}" style="color:${colors.textDark};">${email}</a></td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Téléphone</td><td style="padding:8px; color:${colors.textBody};">${telephone}</td></tr>
            </table>

            <h3 style="color:${colors.textDark}; border-bottom:2px solid ${colors.accent}; padding-bottom:8px; margin-top:16px;">Détails convention</h3>
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding:8px; font-weight:600; width:180px; color:${colors.textDark};">Nombre de sites</td><td style="padding:8px; color:${colors.textBody};">${nombreSites || 1}</td></tr>
              ${surfaceTotale ? `<tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Surface totale</td><td style="padding:8px; color:${colors.textBody};">${surfaceTotale} m²</td></tr>` : ''}
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Services</td><td style="padding:8px; color:${colors.textBody};">${servicesDisplay}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Fréquence</td><td style="padding:8px; color:${colors.textBody};">${frequenceDisplay}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Durée contrat</td><td style="padding:8px; color:${colors.textBody};">${dureeDisplay}</td></tr>
              ${dateDebutSouhaitee ? `<tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Date début</td><td style="padding:8px; color:${colors.textBody};">${dateDebutSouhaitee}</td></tr>` : ''}
            </table>

            ${message ? `
              <div style="margin-top:16px; padding:12px; background:#f8f9fa; border-left:4px solid ${colors.accent};">
                <div style="font-weight:600; margin-bottom:8px; color:${colors.textDark};">Message</div>
                <div style="color:${colors.textBody}; white-space: pre-line;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              </div>
            ` : ''}

            <div style="margin-top:16px; padding:12px; background:#fff3cd; border:1px solid #ffeaa7; border-radius:6px;">
              <div style="font-weight:600; color:#856404; margin-bottom:4px;">📋 Action requise</div>
              <div style="color:#856404; font-size:13px;">Planifier un audit gratuit dans les 48h. Contacter ${contactPrenom} ${contactNom} au ${telephone}.</div>
            </div>
          </div>
          <div style="text-align:center; font-size:12px; color:${colors.textMuted}; padding: 12px 0 20px;">
            <span style="display:inline-block; height:8px; width:8px; background:${colors.accent}; border-radius:50%; margin-right:6px;"></span>
            CCI Conventions B2B — Notification automatique
          </div>
        </div>
      `,
      replyTo: email,
    };

    // User confirmation email
    const userMail = {
      from: `"CCI Services" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🏢 Votre demande de convention a été reçue - CCI Services',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <div style="background: linear-gradient(135deg, ${colors.bgBase} 0%, ${colors.bgElevated} 100%); color:${colors.textPrimary}; padding: 30px 20px; text-align: center;">
            <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
              CCI
            </div>
            <h1 style="margin:0; font-size:28px; font-weight: 700;">
              🏢 <span style="color:${colors.accent};">Demande reçue !</span>
            </h1>
            <p style="margin:12px 0 0; font-size:16px; color:${colors.textSecondary};">
              Merci ${contactPrenom}, nous avons bien reçu votre demande de convention
            </p>
          </div>

          <div style="padding: 30px 20px;">
            <div style="margin-bottom:24px; padding:20px; background:${colors.success}; border:1px solid ${colors.successBorder}; border-radius:8px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
              <div style="font-weight:600; color:${colors.successText}; font-size: 18px; margin-bottom:8px;">Demande de convention confirmée</div>
              <div style="color:${colors.successText}; font-size:14px;">Notre équipe vous contactera sous 48h pour planifier un audit gratuit</div>
            </div>

            <h2 style="color: ${colors.textDark}; font-size: 20px; margin: 0 0 16px 0;">Récapitulatif :</h2>
            
            <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark}; border-bottom: 1px solid #eee;">Entreprise</td><td style="padding:8px; color:${colors.textBody}; border-bottom: 1px solid #eee;">${raisonSociale}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark}; border-bottom: 1px solid #eee;">Secteur</td><td style="padding:8px; color:${colors.textBody}; border-bottom: 1px solid #eee;">${secteurDisplay}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark}; border-bottom: 1px solid #eee;">Services</td><td style="padding:8px; color:${colors.textBody}; border-bottom: 1px solid #eee;">${servicesDisplay}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark}; border-bottom: 1px solid #eee;">Fréquence</td><td style="padding:8px; color:${colors.textBody}; border-bottom: 1px solid #eee;">${frequenceDisplay}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark}; border-bottom: 1px solid #eee;">Durée</td><td style="padding:8px; color:${colors.textBody}; border-bottom: 1px solid #eee;">${dureeDisplay}</td></tr>
            </table>

            <div style="margin-bottom: 20px;">
              <h3 style="color: ${colors.textDark}; font-size: 16px; margin: 0 0 12px 0;">Prochaines étapes :</h3>
              <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 12px;">1</div>
                <div>
                  <div style="font-weight: 600; color: ${colors.textDark};">Prise de contact</div>
                  <div style="color: ${colors.textBody}; font-size: 14px;">Notre responsable commercial vous appellera sous 48h</div>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 12px;">2</div>
                <div>
                  <div style="font-weight: 600; color: ${colors.textDark};">Audit gratuit</div>
                  <div style="color: ${colors.textBody}; font-size: 14px;">Visite de vos locaux pour évaluer précisément vos besoins</div>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 12px;">3</div>
                <div>
                  <div style="font-weight: 600; color: ${colors.textDark};">Proposition personnalisée</div>
                  <div style="color: ${colors.textBody}; font-size: 14px;">Convention sur mesure avec planning, protocoles et tarification</div>
                </div>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <h3 style="margin: 0 0 12px 0; color: ${colors.textDark}; font-size: 18px;">Besoin d'infos maintenant ?</h3>
              <p style="margin: 0 0 16px 0; color: ${colors.textBody}; font-size: 14px;">Notre équipe commerciale est à votre disposition</p>
              <a href="tel:+21698557766" style="display: inline-block; background: ${colors.accent}; color: ${colors.textDark}; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; margin-right: 12px;">
                📞 98 55 77 66
              </a>
              <a href="mailto:contact@cciservices.online" style="display: inline-block; background: transparent; color: ${colors.textDark}; padding: 12px 24px; border: 2px solid ${colors.accent}; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                📧 Email
              </a>
            </div>

            <p style="margin:24px 0 0; color:${colors.textMuted}; font-size:12px; text-align: center;">
              Demande envoyée le ${now}
            </p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <div style="margin-bottom: 12px;">
              <strong style="color: ${colors.textDark};">CCI Services — Conventions Entreprises</strong>
            </div>
            <div style="font-size: 12px; color: ${colors.textMuted}; line-height: 1.5;">
              📧 contact@cciservices.online<br>
              📞 +216 98 55 77 66<br>
              🌐 cciservices.online/entreprises
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #dee2e6; font-size: 11px; color: ${colors.textMuted};">
              Vous recevez cet email suite à votre demande de convention.<br>
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
      } catch (mailErr) {
        console.error('[conventions] Email sending failed (DB insert succeeded):', mailErr?.message || mailErr);
        emailError = mailErr?.message;
        await sendConventionFailureMeasurement(analyticsContext, 'email_error', requestedServices.length);
      }

    return NextResponse.json({
      status: 'success',
      message: emailSent
        ? 'Votre demande de convention a été envoyée avec succès !'
        : 'Votre demande de convention a été enregistrée avec succès ! La notification email sera traitée dès que possible.',
      data: supabaseData,
      details: {
        conventionConfirmed: true,
        conventionSaved: true,
        conventionId: supabaseData.id,
        emailSent,
        ...(emailError && { emailNote: 'Demande enregistrée, notification email en attente.' })
      },
    });

  } catch (error) {
    console.error('[conventions] Convention submission error:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 3).join('\n')
    });
    await sendConventionFailureMeasurement(analyticsContext, 'unexpected_error', requestedServices.length);
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
