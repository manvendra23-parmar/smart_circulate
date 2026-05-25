#!/usr/bin/env node
/**
 * Test Email Sending
 * 
 * This script sends a test email to verify Gmail is working
 * Usage: node testEmailSend.js <recipient-email>
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sendTestEmail() {
  try {
    log('\n🧪 EMAIL SENDING TEST', 'cyan');
    log('='.repeat(60) + '\n', 'cyan');

    // Get recipient email from command line args
    const recipientEmail = process.argv[2];

    if (!recipientEmail) {
      log('❌ Usage: node testEmailSend.js <recipient-email>', 'red');
      log('\nExample: node testEmailSend.js student@gmail.com', 'yellow');
      return;
    }

    // Check credentials
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD) {
      log('❌ Gmail credentials not found in .env', 'red');
      log('   GMAIL_EMAIL:', process.env.GMAIL_EMAIL ? '✅' : '❌', 'red');
      log('   GMAIL_PASSWORD:', process.env.GMAIL_PASSWORD ? '✅' : '❌', 'red');
      return;
    }

    log('📧 Sending test email...', 'yellow');
    log(`   From: ${process.env.GMAIL_EMAIL}`, 'blue');
    log(`   To: ${recipientEmail}\n`, 'blue');

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    // Verify connection first
    log('Verifying email connection...', 'yellow');
    const verified = await transporter.verify();
    if (!verified) {
      log('❌ Email service verification failed', 'red');
      log('   Check your Gmail credentials in .env', 'yellow');
      return;
    }

    log('✅ Connection verified\n', 'green');

    // Send test email
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: recipientEmail,
      subject: '[SmartCircular] Test Email - Please Ignore',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <div style="background-color: #1e88e5; color: white; padding: 20px; border-radius: 5px; text-align: center;">
                <h1 style="margin: 0;">✅ Test Email Successful!</h1>
              </div>

              <div style="padding: 20px; color: #333;">
                <p>This is a test email from <strong>SmartCircular</strong>.</p>
                
                <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #1e88e5; margin: 15px 0;">
                  <h3 style="margin-top: 0;">✅ What this means:</h3>
                  <ul style="margin: 10px 0;">
                    <li>Your Gmail account is properly configured</li>
                    <li>Email sending is working correctly</li>
                    <li>Circulars will be sent successfully</li>
                  </ul>
                </div>

                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p style="margin: 0; color: #666; font-size: 12px;">
                    <strong>Test Details:</strong><br>
                    Sent from: ${process.env.GMAIL_EMAIL}<br>
                    Time: ${new Date().toLocaleString()}
                  </p>
                </div>

                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                  This is an automated test message. If you received this, your email system is working!
                </p>
              </div>

            </div>
          </body>
        </html>
      `
    };

    log('Sending email...', 'yellow');
    const info = await transporter.sendMail(mailOptions);

    log('\n✅ TEST EMAIL SENT SUCCESSFULLY!', 'green');
    log(`   Message ID: ${info.messageId}`, 'green');
    log(`   Response: ${info.response}`, 'green');
    log('\n📩 Check your inbox for the test email.', 'cyan');
    log('   (If not there in 30 seconds, check spam folder)\n', 'cyan');

  } catch (err) {
    log('\n❌ FAILED TO SEND TEST EMAIL', 'red');
    log(`Error: ${err.message}\n`, 'red');

    if (err.message.includes('535') || err.message.includes('AuthenticationFailed')) {
      log('🔐 AUTHENTICATION ERROR', 'yellow');
      log('   Your Gmail credentials are incorrect.', 'yellow');
      log('   Solution:', 'yellow');
      log('   1. Go to: https://myaccount.google.com', 'yellow');
      log('   2. Security → App passwords', 'yellow');
      log('   3. Generate NEW password (Gmail account)', 'yellow');
      log('   4. Use it in .env as GMAIL_PASSWORD', 'yellow');
      log('   5. Restart backend (npm start)', 'yellow');
    } else if (err.message.includes('ENOTFOUND')) {
      log('🌐 NETWORK ERROR', 'yellow');
      log('   Cannot connect to Gmail SMTP server.', 'yellow');
      log('   Check your internet connection.', 'yellow');
    } else if (err.message.includes('ECONNREFUSED')) {
      log('🔗 CONNECTION ERROR', 'yellow');
      log('   Cannot reach Gmail SMTP (port 587).', 'yellow');
      log('   May be blocked by firewall.', 'yellow');
    }

    log('\n📋 Debug Info:', 'blue');
    log(`   From: ${process.env.GMAIL_EMAIL}`, 'blue');
    log(`   Password: ${process.env.GMAIL_PASSWORD ? '(set)' : '(missing)'}`, 'blue');
    log(`   Recipient: ${process.argv[2]}`, 'blue');
  }
}

sendTestEmail();
