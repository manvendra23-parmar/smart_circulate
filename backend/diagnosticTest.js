#!/usr/bin/env node
/**
 * Diagnostic Test for Email System
 * 
 * This script tests:
 * 1. .env configuration
 * 2. Gmail credentials
 * 3. MongoDB connection
 * 4. Email service setup
 * 5. Transporter connection
 */

require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
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

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}\n`, 'cyan');
}

async function runDiagnostics() {
  try {
    // ============================================
    // 1. Check .env file
    // ============================================
    section('1️⃣  CHECKING .ENV FILE');

    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      log('❌ .env file NOT found!', 'red');
      log(`   Expected at: ${envPath}`, 'yellow');
      return;
    }

    log(`✅ .env file found`, 'green');

    // Check Gmail credentials
    if (!process.env.GMAIL_EMAIL) {
      log('❌ GMAIL_EMAIL not set', 'red');
      return;
    }
    if (!process.env.GMAIL_PASSWORD) {
      log('❌ GMAIL_PASSWORD not set', 'red');
      return;
    }

    log(`✅ GMAIL_EMAIL: ${process.env.GMAIL_EMAIL}`, 'green');
    log(`✅ GMAIL_PASSWORD: ${process.env.GMAIL_PASSWORD.substring(0, 3)}****${process.env.GMAIL_PASSWORD.slice(-3)}`, 'green');
    log(`   (Password length: ${process.env.GMAIL_PASSWORD.length} chars)`, 'blue');

    // ============================================
    // 2. Check MongoDB connection
    // ============================================
    section('2️⃣  CHECKING MONGODB CONNECTION');

    if (!process.env.MONGO_URI) {
      log('❌ MONGO_URI not set', 'red');
      return;
    }

    log('Connecting to MongoDB...', 'yellow');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    log('✅ Connected to MongoDB successfully', 'green');

    // Check collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    log(`\nAvailable collections (${collectionNames.length}):`, 'blue');
    collectionNames.forEach(name => {
      log(`  • ${name}`, 'blue');
    });

    // Count records in key collections
    if (collectionNames.includes('faculties')) {
      const facultyCount = await db.collection('faculties').countDocuments();
      log(`\n📊 Faculties in database: ${facultyCount}`, facultyCount > 0 ? 'green' : 'red');
      if (facultyCount === 0) {
        log('   ⚠️  WARNING: No faculties found! Emails won\'t be sent to anyone.', 'yellow');
      } else {
        // Show sample faculty
        const sample = await db.collection('faculties').findOne();
        log(`   Sample: ${sample.name} (${sample.email})`, 'blue');
      }
    }

    if (collectionNames.includes('emails')) {
      const emailCount = await db.collection('emails').countDocuments();
      const sentCount = await db.collection('emails').countDocuments({ status: 'sent' });
      const failedCount = await db.collection('emails').countDocuments({ status: 'failed' });

      log(`\n📧 Emails in database: ${emailCount}`, 'blue');
      log(`   ✅ Sent: ${sentCount}`, 'green');
      log(`   ❌ Failed: ${failedCount}`, 'red');

      if (failedCount > 0) {
        log('\n   Failed emails (showing first 3):', 'yellow');
        const failed = await db.collection('emails')
          .find({ status: 'failed' })
          .limit(3)
          .toArray();

        failed.forEach((email, i) => {
          log(`   ${i + 1}. To: ${email.recipient_email}`, 'yellow');
          log(`      Error: ${email.error_message}`, 'red');
        });
      }
    }

    // ============================================
    // 3. Check Email Service Configuration
    // ============================================
    section('3️⃣  CHECKING EMAIL SERVICE');

    log('Creating NodeMailer transporter...', 'yellow');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    log('✅ Transporter created', 'green');

    // ============================================
    // 4. Test Email Connection
    // ============================================
    section('4️⃣  TESTING EMAIL CONNECTION');

    log('Verifying transporter connection...', 'yellow');

    try {
      const verified = await transporter.verify();
      if (verified) {
        log('✅ Email service is READY!', 'green');
        log('   You can send emails now.', 'green');
      } else {
        log('❌ Email service verification failed', 'red');
        log('   Transporter did not verify successfully', 'yellow');
      }
    } catch (err) {
      log('❌ Email service verification failed', 'red');
      log(`   Error: ${err.message}`, 'red');

      if (err.message.includes('535')) {
        log('\n   🔐 AUTHENTICATION ERROR:', 'yellow');
        log('   - Check Gmail email address', 'yellow');
        log('   - Generate new App Password at: https://myaccount.google.com', 'yellow');
        log('   - Use 16-character app password (with spaces)', 'yellow');
      } else if (err.message.includes('ENOTFOUND') || err.message.includes('timeout')) {
        log('\n   🌐 NETWORK ERROR:', 'yellow');
        log('   - Check internet connection', 'yellow');
        log('   - Check if port 587 is open', 'yellow');
      }
    }

    // ============================================
    // 5. Summary
    // ============================================
    section('📋 DIAGNOSTIC SUMMARY');

    log('✅ Configuration Status:', 'green');
    log('   ✓ .env file present', 'green');
    log('   ✓ Gmail credentials configured', 'green');
    log('   ✓ MongoDB connected', 'green');
    log('   ✓ Email service setup', 'green');

    log('\n📊 Database Status:', 'blue');
    const Faculty = require('./models/Faculty');
    const Email = require('./models/Email');

    const facultyCount = await Faculty.countDocuments();
    const emailCount = await Email.countDocuments();

    log(`   Faculties: ${facultyCount}`, facultyCount > 0 ? 'green' : 'yellow');
    log(`   Emails: ${emailCount}`, 'blue');

    log('\n🚀 Next Steps:', 'cyan');
    if (facultyCount === 0) {
      log('   1. Add faculty records to database', 'yellow');
      log('   2. Upload a circular', 'yellow');
    } else {
      log('   1. Upload a circular', 'yellow');
      log('   2. Emails should be sent automatically', 'yellow');
      log('   3. Check MongoDB for email records', 'yellow');
    }

    await mongoose.disconnect();
    log('\n✅ Diagnostic complete!\n', 'green');

  } catch (err) {
    log(`\n❌ Diagnostic failed: ${err.message}`, 'red');
    log(err.stack, 'red');
    await mongoose.disconnect();
  }
}

// Run diagnostics
runDiagnostics();
