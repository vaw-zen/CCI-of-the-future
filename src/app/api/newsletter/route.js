import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createServiceClient } from '@/libs/supabase';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, acceptedPrivacy, website, source } = body;

    // Honeypot check — bots fill this hidden field, real users never see it
    if (website) {
      // Return fake success so bots think it worked
      return NextResponse.json({
        status: 'success',
        message: 'Inscription réussie ! Vérifiez votre boîte mail.',
      });
    }

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json({
        status: 'validation_failed',
        message: 'L\'adresse email est requise.'
      }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({
        status: 'validation_failed',
        message: 'Veuillez fournir une adresse email valide.'
      }, { status: 400 });
    }

    if (!acceptedPrivacy) {
      return NextResponse.json({
        status: 'validation_failed',
        message: 'Vous devez accepter la politique de confidentialité.'
      }, { status: 400 });
    }

    // Check Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return NextResponse.json({
        status: 'config_error',
        message: 'Service email non configuré.'
      }, { status: 500 });
    }

    const supabase = createServiceClient();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_verified')
      .eq('email', trimmedEmail)
      .single();

    let verificationToken;

    if (existing) {
      if (existing.is_verified) {
        return NextResponse.json({
          status: 'already_subscribed',
          message: 'Vous êtes déjà inscrit(e) à notre newsletter.',
        });
      }

      // Re-subscribe: regenerate token for unverified email
      verificationToken = randomUUID();
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          verification_token: verificationToken,
          created_at: new Date().toISOString(),
          source: source || 'direct',
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        return NextResponse.json({
          status: 'error',
          message: 'Erreur lors de l\'inscription. Veuillez réessayer.',
        }, { status: 500 });
      }
    } else {
      // New subscriber
      verificationToken = randomUUID();
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: trimmedEmail,
          verification_token: verificationToken,
          source: source || 'direct',
          accepted_privacy: true,
        });

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return NextResponse.json({
          status: 'error',
          message: 'Erreur lors de l\'inscription. Veuillez réessayer.',
        }, { status: 500 });
      }
    }

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const verificationUrl = `${baseUrl}/api/newsletter/verify?token=${verificationToken}`;

    // Send verification email
    const { default: nodemailer } = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.verify().catch(() => {
      throw new Error('SMTP verification failed');
    });

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
    };

    const verificationMail = {
      from: `"CCI Services" <${process.env.GMAIL_USER}>`,
      to: trimmedEmail,
      subject: '📧 Confirmez votre inscription à la newsletter CCI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${colors.bgBase} 0%, ${colors.bgElevated} 100%); color:${colors.textPrimary}; padding: 30px 20px; text-align: center;">
            <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
              CCI
            </div>
            <h1 style="margin:0; font-size:26px; font-weight: 700;">
              <span style="color:${colors.accent};">Confirmez votre inscription</span>
            </h1>
            <p style="margin:12px 0 0; font-size:15px; color:${colors.textSecondary};">
              Un dernier clic pour rejoindre notre newsletter
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">
            <p style="color:${colors.textBody}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Bonjour,<br><br>
              Merci de votre intérêt pour la newsletter CCI Services ! Pour confirmer votre inscription et commencer à recevoir nos conseils d'experts, nouveautés et offres exclusives, cliquez sur le bouton ci-dessous :
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: ${colors.accent}; color: ${colors.textDark}; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 16px;">
                Confirmer mon inscription
              </a>
            </div>

            <p style="color: ${colors.textMuted}; font-size: 13px; text-align: center; margin: 24px 0 0 0;">
              Si vous n'avez pas demandé cette inscription, ignorez simplement cet email.
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
              🌐 cciservices.online
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(verificationMail);

    return NextResponse.json({
      status: 'success',
      message: 'Vérifiez votre boîte mail pour confirmer votre inscription.',
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de l\'inscription. Veuillez réessayer.',
      details: error?.message
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
