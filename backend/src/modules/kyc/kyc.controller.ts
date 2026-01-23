import { Request, Response } from 'express';
import { KYCService } from './kyc.service';
import { AppError, ErrorCode } from '../../common/constants/errors';
import { z } from 'zod';
import { KYCDocumentType } from './kyc.model';
import { asyncHandler } from '../../common/utils/asyncHandler';

const submitKycSchema = z.object({
    type: z.nativeEnum(KYCDocumentType),
    fileUrl: z.string().url(),
    fileId: z.string().min(1),
});

export const kycController = {
    getAuthParams: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const authParams = KYCService.getAuthParams();
        res.json(authParams);
    }),

    submitDocument: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.user || req.user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const data = submitKycSchema.parse(req.body);
        const document = await KYCService.submitDocument(req.user.userId, data);

        res.status(201).json({
            message: 'Document submitted successfully',
            document,
        });
    }),

    getDocuments: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.user || req.user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        const documents = await KYCService.getMerchantDocuments(req.user.userId);
        res.json({ documents });
    }),

    finalizeKyc: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.user || req.user.type !== 'merchant') {
            throw new AppError(ErrorCode.UNAUTHORIZED, 'Merchant authentication required', 401);
        }

        await KYCService.finalizeKyc(req.user.userId);

        res.json({
            message: 'KYC documents submitted for verification',
        });
    }),
};
