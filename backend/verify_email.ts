
import dotenv from 'dotenv';
dotenv.config();

import { EmailService } from './src/common/services/email.service';

async function verifyEmail() {
    console.log('Testing Email Service...');

    // Use the admin email as recipient
    const recipient = process.env.ADMIN_EMAIL || 'admin@paylor.com';
    console.log(`Sending test email to: ${recipient}`);

    const success = await EmailService.send({
        to: [{ email: recipient, name: 'Admin User' }],
        subject: 'Paylor Email Configuration Test',
        htmlContent: '<h3>It works!</h3><p>Your Brevo API Key is configured correctly.</p>'
    });

    if (success) {
        console.log('✅ TEST PASSED: Email accepted by Brevo.');
    } else {
        console.error('❌ TEST FAILED: Email rejected.');
        process.exit(1);
    }
}

verifyEmail();
