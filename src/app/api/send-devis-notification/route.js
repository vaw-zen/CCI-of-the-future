import nodemailer from 'nodemailer';
import { createServiceClient } from '@/libs/supabase';

export async function POST(request) {
  try {
    const { devisId } = await request.json();
    
    if (!devisId) {
      console.error('Missing devisId in request');
      return Response.json({ error: 'Missing devisId' }, { status: 400 });
    }

    console.log('Fetching devis request with ID:', devisId);

    // Use service client for server-side operations with elevated permissions
    const supabase = createServiceClient();

    // Get the devis request from Supabase
    const { data: devisRequest, error } = await supabase
      .from('devis_requests')
      .select('*')
      .eq('id', devisId)
      .single();

    if (error) {
      console.error('Supabase error fetching devis:', error);
      return Response.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }

    if (!devisRequest) {
      console.error('Devis request not found with ID:', devisId);
      return Response.json({ error: 'Devis request not found' }, { status: 404 });
    }

    console.log('Found devis request:', devisRequest.nom, devisRequest.prenom);

    // Send email notification
    const emailSent = await sendDevisNotificationEmail(devisRequest);
    
    if (emailSent) {
      return Response.json({ success: true, message: 'Email sent successfully' });
    } else {
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendDevisNotificationEmail(record) {
  try {
    console.log('Starting email sending process...');
    console.log('Environment variables check:', {
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailPass: !!process.env.GMAIL_PASS,
      gmailUser: process.env.GMAIL_USER?.substring(0, 5) + '...' // Show first 5 chars for debugging
    });

    // Create transporter using Gmail credentials from env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    console.log('Transporter created successfully');

    console.log('Creating email template...');
    const emailHtml = createEmailTemplate(record);
    const emailSubject = `Nouvelle demande de devis - ${formatService(record.type_service)}`;

    console.log('Email subject:', emailSubject);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to yourself
      subject: emailSubject,
      html: emailHtml,
      replyTo: record.email
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      replyTo: mailOptions.replyTo
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;

  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

function formatService(service) {
  const services = {
    'salon': 'Nettoyage de salon (canapés, fauteuils)',
    'tapis': 'Nettoyage de tapis/moquettes',
    'tapisserie': 'Tapisserie (confection, restauration)',
    'marbre': 'Polissage de marbre',
    'tfc': 'Nettoyage TFC (bureaux, commerces)'
  };
  return services[service] || service;
}

function formatPersonType(type) {
  return type === 'physique' ? 'Personne physique' : 'Personne morale (Entreprise)';
}

function formatTimeSlot(slot) {
  const slots = {
    'matin': 'Matin (8h-12h)',
    'apres_midi': 'Après-midi (14h-18h)',
    'soir': 'Soir (18h-20h)',
    'flexible': 'Flexible'
  };
  return slots[slot] || slot;
}

function formatDate(dateString) {
  if (!dateString) return 'Non spécifiée';
  return new Date(dateString).toLocaleDateString('fr-FR');
}

function createEmailTemplate(record) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle demande de devis</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .section { margin-bottom: 30px; padding: 25px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #fafafa; }
        .section h3 { color: #495057; margin-top: 0; padding-bottom: 15px; border-bottom: 2px solid #007bff; font-size: 20px; }
        .field { margin-bottom: 15px; }
        .field strong { color: #495057; display: inline-block; min-width: 200px; font-weight: 600; }
        .highlight { background: linear-gradient(135deg, #fff3cd, #ffeaa7); padding: 20px; border-radius: 8px; border-left: 5px solid #ffc107; margin-bottom: 30px; }
        .highlight strong { color: #856404; }
        .footer { margin-top: 40px; padding: 25px; background-color: #f8f9fa; border-radius: 8px; font-size: 14px; color: #6c757d; }
        .footer ul { margin: 15px 0; padding-left: 20px; }
        .footer li { margin-bottom: 5px; }
        .contact-info { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .service-details { background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .urgent { color: #dc3545; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 CCI Services</h1>
          <h2>Nouvelle demande de devis</h2>
          <p>Demande reçue le ${formatDate(record.created_at)}</p>
        </div>

        <div class="highlight">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Service demandé :</strong> ${formatService(record.type_service)}<br>
              <strong>Type de client :</strong> ${formatPersonType(record.type_personne)}
            </div>
            <div class="urgent">⚡ TRAITEMENT URGENT</div>
          </div>
        </div>

        <div class="section">
          <h3>👤 Informations du client</h3>
          <div class="contact-info">
            <div class="field"><strong>Type de personne :</strong> ${formatPersonType(record.type_personne)}</div>
            ${record.matricule_fiscale ? `<div class="field"><strong>Matricule fiscale :</strong> ${record.matricule_fiscale}</div>` : ''}
            <div class="field"><strong>${record.type_personne === 'morale' ? 'Raison sociale' : 'Nom'} :</strong> ${record.nom}</div>
            <div class="field"><strong>${record.type_personne === 'morale' ? 'Contact' : 'Prénom'} :</strong> ${record.prenom}</div>
            <div class="field"><strong>Email :</strong> <a href="mailto:${record.email}" style="color: #007bff; text-decoration: none;">${record.email}</a></div>
            <div class="field"><strong>Téléphone :</strong> <a href="tel:${record.telephone}" style="color: #007bff; text-decoration: none;">${record.telephone}</a></div>
          </div>
        </div>

        <div class="section">
          <h3>📍 Lieu d'intervention</h3>
          <div class="field"><strong>Adresse complète :</strong> ${record.adresse}</div>
          <div class="field"><strong>Ville :</strong> ${record.ville}</div>
          ${record.code_postal ? `<div class="field"><strong>Code postal :</strong> ${record.code_postal}</div>` : ''}
          <div class="field"><strong>Type de logement :</strong> ${record.type_logement}</div>
          ${record.surface ? `<div class="field"><strong>Surface totale :</strong> ${record.surface} m²</div>` : ''}
        </div>

        <div class="section">
          <h3>🧹 Service demandé</h3>
          <div class="service-details">
            <div class="field"><strong>Type de service :</strong> ${formatService(record.type_service)}</div>
            ${record.nombre_places ? `<div class="field"><strong>Nombre de places :</strong> ${record.nombre_places}</div>` : ''}
            ${record.surface_service ? `<div class="field"><strong>Surface à traiter :</strong> ${record.surface_service} m²</div>` : ''}
          </div>
        </div>

        <div class="section">
          <h3>📅 Préférences de rendez-vous</h3>
          ${record.date_preferee ? `<div class="field"><strong>Date préférée :</strong> ${formatDate(record.date_preferee)}</div>` : '<div class="field"><strong>Date préférée :</strong> Non spécifiée</div>'}
          <div class="field"><strong>Créneau horaire :</strong> ${formatTimeSlot(record.heure_preferee)}</div>
        </div>

        ${record.message ? `
        <div class="section">
          <h3>💬 Message du client</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 3px solid #007bff;">
            <p style="margin: 0; font-style: italic;">"${record.message.replace(/\n/g, '<br>')}"</p>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <h3>📧 Préférences de communication</h3>
          <div class="field"><strong>Newsletter :</strong> <span style="color: ${record.newsletter ? '#28a745' : '#dc3545'};">${record.newsletter ? '✅ Oui' : '❌ Non'}</span></div>
          <div class="field"><strong>Conditions acceptées :</strong> <span style="color: ${record.conditions ? '#28a745' : '#dc3545'};">${record.conditions ? '✅ Oui' : '❌ Non'}</span></div>
        </div>

        <div class="footer">
          <h4 style="color: #495057; margin-top: 0;">⚡ Actions prioritaires :</h4>
          <ul>
            <li><strong>Contacter le client dans les 2h</strong> (pendant les heures ouvrables)</li>
            <li>Confirmer les détails et programmer une visite si nécessaire</li>
            <li>Préparer le devis personnalisé selon les spécifications</li>
            <li>Envoyer le devis dans les 24h maximum</li>
          </ul>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 5px;">
            <p style="margin: 0;"><strong>Contact direct :</strong></p>
            <p style="margin: 5px 0;">📧 <a href="mailto:${record.email}">${record.email}</a></p>
            <p style="margin: 5px 0;">📞 <a href="tel:${record.telephone}">${record.telephone}</a></p>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #6c757d;"><em>Cette demande a été générée automatiquement depuis le site web CCI Services le ${formatDate(record.created_at)}.</em></p>
        </div>
      </div>
    </body>
    </html>
  `;
}