import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
console.log(`📂 Loading .env from: ${envPath}`);
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
    console.warn('⚠️ Warning: Error loading .env file:', dotenvResult.error.message);
}

import { EmailService } from './common/services/email.service';

async function sendTestEmail() {
    const email = 'patysales397@gmail.com';

    if (!process.env.BREVO_API_KEY) {
        console.error('❌ Error: BREVO_API_KEY is undefined after loading .env');
        console.log('Available keys (first few characters):', Object.keys(process.env).filter(k => k.includes('BREVO') || k.includes('EMAIL')));
        return;
    }

    console.log(`🚀 Sending test payment success email to ${email}...`);

    const result = await EmailService.sendPaymentSuccessEmail(
        email,
        'Test Merchant',
        {
            amount: 7500,
            currency: 'KES',
            reference: 'TEST-REF-' + Date.now(),
            phone: '254712345678'
        }
    );

    if (result) {
        console.log('✅ Test email SENT successfully!');
    } else {
        console.error('❌ Test email FAILED to send. Check your BREVO_API_KEY.');
    }
}

sendTestEmail().catch(err => {
    console.error('💥 Unexpected error during test:', err);
});
