import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const formData = body?.formData || body || {};

    const name = (formData.name || '').toString().trim();
    const email = (formData.email || '').toString().trim();
    const phone = (formData.phone || '').toString().trim();
    const projectType = (formData.projectType || '').toString().trim();
    const message = (formData.message || '').toString().trim();

    if (!name || !email) {
      return NextResponse.json({ status: 'validation_failed', message: 'Name and email are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ status: 'validation_failed', message: 'Please provide a valid email.' }, { status: 400 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return NextResponse.json({ status: 'config_error', message: 'Email service not configured.' }, { status: 500 });
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
    };

    // Detect if this is a devis request
    const isDevisRequest = formData.formType === 'devis' || (projectType && projectType.includes('Demande de devis'));
    
    const adminMail = {
      from: `"CCI Website" <${process.env.GMAIL_USER}>`,
      to: adminRecipient,
      subject: isDevisRequest ? `🏠 Nouvelle demande de DEVIS — ${name}` : `Nouvelle demande de contact — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <div style="background:${colors.bgBase}; color:${colors.textPrimary}; padding: 16px 20px;">
            <h1 style="margin:0; font-size:20px;">
              <span style="color:${colors.accent};">${isDevisRequest ? '🏠 Nouvelle demande de DEVIS' : 'Nouvelle demande de contact'}</span>
            </h1>
            <p style="margin:4px 0 0; font-size:12px; color:${colors.textSecondary};">Reçue le ${now}</p>
            ${isDevisRequest ? `<p style="margin:8px 0 0; font-size:14px; color:${colors.accent}; font-weight:600;">⚡ PRIORITÉ: Demande de devis</p>` : ''}
          </div>
          <div style="padding: 20px;">
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding:8px; font-weight:600; width:160px; color:${colors.textDark};">Nom</td><td style="padding:8px; color:${colors.textBody};">${name}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Email</td><td style="padding:8px; color:${colors.textBody};"><a href="mailto:${email}" style="color:${colors.textDark}; text-decoration:none;">${email}</a></td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Téléphone</td><td style="padding:8px; color:${colors.textBody};">${phone || '—'}</td></tr>
              <tr><td style="padding:8px; font-weight:600; color:${colors.textDark};">Type de projet</td><td style="padding:8px; color:${colors.textBody};">${projectType || '—'}</td></tr>
            </table>
            ${message ? `
              <div style="margin-top:16px; padding:12px; background:${isDevisRequest ? '#f8f9fa' : colors.white}; border-left:4px solid ${colors.accent};">
                <div style="font-weight:600; margin-bottom:8px; color:${colors.textDark};">${isDevisRequest ? 'Détails de la demande de devis' : 'Message'}</div>
                <div style="color:${colors.textBody}; white-space: pre-line;">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
              </div>
            ` : ''}
            ${isDevisRequest ? `
              <div style="margin-top:16px; padding:12px; background:#fff3cd; border:1px solid #ffeaa7; border-radius:6px;">
                <div style="font-weight:600; color:#856404; margin-bottom:4px;">📋 Action requise</div>
                <div style="color:#856404; font-size:13px;">Cette demande de devis nécessite un suivi rapide. Contactez le client dans les 24h.</div>
              </div>
            ` : ''}
          </div>
          <div style="text-align:center; font-size:12px; color:${colors.textMuted}; padding: 12px 0 20px;">
            <span style="display:inline-block; height:8px; width:8px; background:${colors.accent}; border-radius:50%; margin-right:6px;"></span>
            CCI — Notification automatique
          </div>
        </div>
      `,
      replyTo: email,
    };

    const userMail = {
      from: `"CCI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: isDevisRequest ? '🏠 Votre demande de devis a été reçue' : 'Nous avons bien reçu votre message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:${colors.white};">
          <div style="background:${colors.bgBase}; color:${colors.textPrimary}; padding: 16px 20px;">
            <h1 style="margin:0; font-size:20px;">
              <span style="color:${colors.accent};">Merci !</span> ${name}
            </h1>
            <p style="margin:4px 0 0; font-size:12px; color:${colors.textSecondary};">
              ${isDevisRequest ? 'Nous avons bien reçu votre demande de devis.' : 'Nous avons bien reçu votre demande de contact.'}
            </p>
          </div>
          <div style="padding: 20px;">
            ${isDevisRequest ? `
              <div style="margin-bottom:16px; padding:12px; background:#d4edda; border:1px solid #c3e6cb; border-radius:6px;">
                <div style="font-weight:600; color:#155724; margin-bottom:4px;">✅ Demande de devis enregistrée</div>
                <div style="color:#155724; font-size:13px;">Votre demande sera traitée dans les plus brefs délais. Un expert vous contactera sous 24h pour programmer un rendez-vous.</div>
              </div>
              <p style="margin:0 0 12px; color:${colors.textBody};">Prochaines étapes :</p>
              <ul style="margin:0 0 16px; padding-left:20px; color:${colors.textBody};">
                <li>📞 Appel de confirmation sous 24h</li>
                <li>📅 Prise de rendez-vous pour évaluation</li>
                <li>📋 Devis détaillé gratuit</li>
                <li>🤝 Proposition personnalisée</li>
              </ul>
            ` : `
              <p style="margin:0 0 12px; color:${colors.textBody};">Notre équipe vous recontactera très prochainement.</p>
            `}
            ${message ? `
              <p style="margin:0 0 8px; color:${colors.textBody};">${isDevisRequest ? 'Récapitulatif de votre demande :' : 'Récapitulatif de votre message :'}</p>
              <blockquote style="margin:0; padding:12px; background:${colors.white}; border-left:4px solid ${colors.accent}; color:${colors.textBody}; white-space: pre-line;">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</blockquote>
            ` : ''}
            <p style="margin:16px 0 0; color:${colors.textMuted}; font-size:13px;">Envoyé le ${now}</p>
            ${isDevisRequest ? `
              <div style="margin-top:16px; padding:12px; background:#f8f9fa; border-radius:6px;">
                <div style="font-size:13px; color:${colors.textMuted};">
                  <strong>Besoin d'aide ?</strong><br>
                  📞 Appelez-nous : +216 XX XXX XXX<br>
                  📧 Email : contact@cci-tunisie.com
                </div>
              </div>
            ` : ''}
          </div>
          <div style="text-align:center; font-size:12px; color:${colors.textMuted}; padding: 12px 0 20px;">
            <span style="display:inline-block; height:8px; width:8px; background:${colors.accent}; border-radius:50%; margin-right:6px;"></span>
            CCI — Merci de ne pas répondre à cet email
          </div>
        </div>
      `,
    };

    const adminResult = await transporter.sendMail(adminMail);
    const userResult = await transporter.sendMail(userMail);

    return NextResponse.json({
      status: 'mail_sent',
      message: 'Votre message a été envoyé avec succès.',
      details: { adminMessageId: adminResult?.messageId, userMessageId: userResult?.messageId },
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Failed to send message', details: error?.message }, { status: 500 });
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


