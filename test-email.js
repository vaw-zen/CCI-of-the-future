const nodemailer = require('nodemailer');

console.log('🧪 Testing Gmail SMTP configuration...');
console.log('Email:', 'cci.services.tn@gmail.com');
console.log('Password:', 'ztofhlikbiqntotd');
console.log('');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cci.services.tn@gmail.com',
    pass: 'ztofhlikbiqntotd'
  }
});

// Test the connection
console.log('Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration failed:');
    console.log('Error:', error.message);
    console.log('');
    console.log('🔧 Possible solutions:');
    console.log('1. Enable 2-Step Verification on Gmail');
    console.log('2. Generate a new App Password');
    console.log('3. Update GMAIL_PASS in .env.local');
  } else {
    console.log('✅ Email configuration is working!');
    console.log('SMTP connection successful');
    
    // Send a test email
    console.log('');
    console.log('📧 Sending test email...');
    
    transporter.sendMail({
      from: 'cci.services.tn@gmail.com',
      to: 'cci.services.tn@gmail.com',
      subject: 'Test Email - CCI Website',
      text: 'This is a test email from your CCI website. Email configuration is working correctly!'
    }, (err, info) => {
      if (err) {
        console.log('❌ Failed to send test email:', err.message);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
      }
    });
  }
});