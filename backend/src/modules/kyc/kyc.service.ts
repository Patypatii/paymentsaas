import ImageKit from 'imagekit';
import { config } from '../../config/env';
import { KYCDocumentModel, KYCDocumentType } from './kyc.model';
import { AppError, ErrorCode } from '../../common/constants/errors';
import mongoose from 'mongoose';

const imagekit = new ImageKit({
    publicKey: config.imagekit.publicKey,
    privateKey: config.imagekit.privateKey,
    urlEndpoint: config.imagekit.urlEndpoint,
});

export class KYCService {
    /**
     * Generate authentication parameters for client-side upload
     */
    static getAuthParams() {
        return imagekit.getAuthenticationParameters();
    }

    /**
     * Submit a document record after successful upload
     */
    static async submitDocument(
        merchantId: string,
        data: {
            type: KYCDocumentType;
            fileUrl: string;
            fileId: string;
        }
    ) {
        // Check if document already exists for this merchant and type
        const existing = await KYCDocumentModel.findOne({
            merchantId: new mongoose.Types.ObjectId(merchantId),
            type: data.type,
        });

        if (existing) {
            // Update existing record
            existing.fileUrl = data.fileUrl;
            existing.fileId = data.fileId;
            existing.status = 'DRAFT' as any; // Keep/reset to draft on upload
            await existing.save();
            return existing;
        }

        const document = await KYCDocumentModel.create({
            merchantId: new mongoose.Types.ObjectId(merchantId),
            type: data.type,
            fileUrl: data.fileUrl,
            fileId: data.fileId,
            status: 'DRAFT' as any,
        });

        return document;
    }

    /**
     * Finalize KYC submission: update all DRAFT documents to PENDING
     */
    static async finalizeKyc(merchantId: string) {
        const result = await KYCDocumentModel.updateMany(
            {
                merchantId: new mongoose.Types.ObjectId(merchantId),
                status: 'DRAFT'
            },
            { status: 'PENDING' }
        );

        if (result.matchedCount === 0) {
            throw new AppError(ErrorCode.VALIDATION_ERROR, 'No draft documents found to submit', 400);
        }

        return result;
    }

    /**
     * Get all documents for a merchant
     */
    static async getMerchantDocuments(merchantId: string) {
        return KYCDocumentModel.find({
            merchantId: new mongoose.Types.ObjectId(merchantId),
        }).sort({ createdAt: -1 });
    }
}
