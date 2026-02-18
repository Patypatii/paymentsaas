
import { ApiKeyService } from './src/modules/api-keys/apiKey.service';
import { ApiKeyModel } from './src/modules/api-keys/apiKey.model';
import { MerchantModel } from './src/modules/merchants/merchant.model';
import mongoose from 'mongoose';
import { config } from './src/config/env';

// Mock Config if needed
// config.database.uri ...

async function verifyApiKeyFlow() {
    try {
        console.log('Connecting to DB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not set');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create a dummy merchant
        console.log('Creating Test Merchant...');
        const merchant = await MerchantModel.create({
            username: `test_merchant_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            passwordHash: 'hash',
            businessName: 'Test Biz',
            contactPhone: '254700000000',
            status: 'ACTIVE'
        });
        console.log(`Merchant Created: ${merchant.id}`);

        // 2. Generate API Key
        console.log('Generating API Key...');
        const { apiKey, id } = await ApiKeyService.generateKey(merchant.id, 'Test Key');
        console.log(`API Key Generated: ${apiKey} (ID: ${id})`);

        // 3. Verify Key
        console.log('Verifying Key...');
        const validation = await ApiKeyService.validateKey(apiKey);

        if (validation.merchantId === merchant.id) {
            console.log('✅ API Key Validation SUCCESS');
        } else {
            console.error('❌ API Key Validation FAILED: Merchant ID mismatch');
        }

        // 4. Test Invalid Key
        console.log('Testing Invalid Key...');
        try {
            await ApiKeyService.validateKey('invalid_key');
            console.error('❌ Invalid Key check FAILED (Should have thrown error)');
        } catch (e) {
            console.log('✅ Invalid Key check PASSED (Error thrown as expected)');
        }

        // Cleanup
        await ApiKeyModel.deleteMany({ merchantId: merchant.id });
        await MerchantModel.deleteOne({ _id: merchant.id });
        console.log('Cleanup Done.');

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run if this file is executed directly
verifyApiKeyFlow();
