import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, acceptedPrivacy } = body;

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

    // Admin notification email
    const adminMail = {
      from: `"CCI Newsletter" <${process.env.GMAIL_USER}>`,
      to: adminRecipient,
      subject: `📧 Nouvelle inscription newsletter — ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <div style="background:${colors.bgBase}; color:${colors.textPrimary}; padding: 16px 20px;">
            <h1 style="margin:0; font-size:20px;">
              <span style="color:${colors.accent};">📧 Nouvelle inscription newsletter</span>
            </h1>
            <p style="margin:4px 0 0; font-size:12px; color:${colors.textSecondary};">Reçue le ${now}</p>
          </div>
          <div style="padding: 20px;">
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding:8px; font-weight:600; width:160px; color:${colors.textDark};">Email</td><td style="padding:8px; color:${colors.textBody};"><a href="mailto:${email}" style="color:${colors.textDark}; text-decoration:none;">${email}</a></td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Date d'inscription</td><td style="padding:8px; color:${colors.textBody};">${now}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Politique acceptée</td><td style="padding:8px; color:${colors.textBody};">✅ Oui</td></tr>
            </table>
            <div style="margin-top:16px; padding:12px; background:#f8f9fa; border-left:4px solid ${colors.accent};">
              <div style="font-weight:600; margin-bottom:8px; color:${colors.textDark};">Action suggérée</div>
              <div style="color:${colors.textBody}; font-size:13px;">Ajoutez cette adresse à votre liste de diffusion newsletter pour les futurs envois.</div>
            </div>
          </div>
          <div style="text-align:center; font-size:12px; color:${colors.textMuted}; padding: 12px 0 20px;">
            <span style="display:inline-block; height:8px; width:8px; background:${colors.accent}; border-radius:50%; margin-right:6px;"></span>
            CCI Newsletter — Notification automatique
          </div>
        </div>
      `,
    };

    // Welcome email for the subscriber
    const welcomeMail = {
      from: `"CCI Services" <${process.env.GMAIL_USER}>`,
      to: email.trim(),
      subject: '🎉 Bienvenue dans la newsletter CCI !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${colors.bgBase} 0%, ${colors.bgElevated} 100%); color:${colors.textPrimary}; padding: 30px 20px; text-align: center;">
            <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
              CCI
            </div>
            <h1 style="margin:0; font-size:28px; font-weight: 700;">
              🎉 <span style="color:${colors.accent};">Bienvenue !</span>
            </h1>
            <p style="margin:12px 0 0; font-size:16px; color:${colors.textSecondary};">
              Merci de vous être inscrit(e) à notre newsletter
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">
            <div style="margin-bottom:24px; padding:20px; background:${colors.success}; border:1px solid ${colors.successBorder}; border-radius:8px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
              <div style="font-weight:600; color:${colors.successText}; font-size: 18px; margin-bottom:8px;">Inscription confirmée</div>
              <div style="color:${colors.successText}; font-size:14px;">Votre adresse <strong>${email}</strong> a été ajoutée à notre liste de diffusion.</div>
            </div>

            <h2 style="color: ${colors.textDark}; font-size: 20px; margin: 0 0 16px 0;">Ce que vous recevrez :</h2>
            
            <div style="margin-bottom: 20px;">
              <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">
                  💡
                </div>
                <div>
                  <h3 style="margin: 0 0 4px 0; color: ${colors.textDark}; font-size: 16px;">Conseils d'experts</h3>
                  <p style="margin: 0; color: ${colors.textBody}; font-size: 14px; line-height: 1.5;">Tips et astuces de nettoyage professionnel pour maintenir vos espaces impeccables.</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">
                  🚀
                </div>
                <div>
                  <h3 style="margin: 0 0 4px 0; color: ${colors.textDark}; font-size: 16px;">Nouveautés & Services</h3>
                  <p style="margin: 0; color: ${colors.textBody}; font-size: 14px; line-height: 1.5;">Soyez les premiers informés de nos nouveaux services et innovations.</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="background: ${colors.accent}; color: ${colors.textDark}; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0;">
                  🎁
                </div>
                <div>
                  <h3 style="margin: 0 0 4px 0; color: ${colors.textDark}; font-size: 16px;">Offres exclusives</h3>
                  <p style="margin: 0; color: ${colors.textBody}; font-size: 14px; line-height: 1.5;">Promotions spéciales et réductions réservées aux abonnés newsletter.</p>
                </div>
              </div>
            </div>

            <!-- CTA Section -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <h3 style="margin: 0 0 12px 0; color: ${colors.textDark}; font-size: 18px;">Besoin d'un service maintenant ?</h3>
              <p style="margin: 0 0 16px 0; color: ${colors.textBody}; font-size: 14px;">N'attendez pas la prochaine newsletter !</p>
              <a href="tel:+21698557766" style="display: inline-block; background: ${colors.accent}; color: ${colors.textDark}; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                📞 Appelez maintenant
              </a>
            </div>

            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
              <h3 style="color: ${colors.textDark}; font-size: 16px; margin: 0 0 12px 0;">Nos services :</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; color: ${colors.textBody};">
                <div>• Nettoyage industriel</div>
                <div>• Restauration marbre</div>
                <div>• Nettoyage post-chantier</div>
                <div>• Entretien yachts</div>
                <div>• Nettoyage tapis/moquettes</div>
                <div>• Services d'urgence 24/7</div>
              </div>
            </div>

            <p style="margin:24px 0 0; color:${colors.textMuted}; font-size:12px; text-align: center;">
              Inscrit le ${now}
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
              Vous recevez cet email car vous vous êtes inscrit(e) à notre newsletter.<br>
              <a href="#" style="color: ${colors.textMuted};">Se désabonner</a> | <a href="#" style="color: ${colors.textMuted};">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      `,
    };

    // Send emails
    const adminResult = await transporter.sendMail(adminMail);
    const userResult = await transporter.sendMail(welcomeMail);

    return NextResponse.json({
      status: 'success',
      message: 'Inscription réussie ! Vérifiez votre boîte mail.',
      details: { 
        adminMessageId: adminResult?.messageId, 
        userMessageId: userResult?.messageId 
      },
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