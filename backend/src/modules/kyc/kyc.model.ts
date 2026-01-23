import mongoose, { Schema, Document } from 'mongoose';

export enum KYCDocumentType {
    ID_FRONT = 'ID_FRONT',
    ID_BACK = 'ID_BACK',
    BUSINESS_LICENSE = 'BUSINESS_LICENSE',
    TAX_CERTIFICATE = 'TAX_CERTIFICATE',
    OTHER = 'OTHER'
}

export enum KYCStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface IKYCDocument extends Document {
    merchantId: mongoose.Types.ObjectId;
    type: KYCDocumentType;
    status: KYCStatus;
    fileUrl: string;
    fileId: string; // ImageKit fileId
    rejectionReason?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const KYCDocumentSchema: Schema = new Schema({
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
    type: {
        type: String,
        enum: Object.values(KYCDocumentType),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(KYCStatus),
        default: KYCStatus.DRAFT
    },
    fileUrl: { type: String, required: true },
    fileId: { type: String, required: true },
    rejectionReason: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    verifiedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc: any, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Ensure a merchant only has one active document of each type (optional, can be refined)
KYCDocumentSchema.index({ merchantId: 1, type: 1 });

export const KYCDocumentModel = mongoose.model<IKYCDocument>('KYCDocument', KYCDocumentSchema);
