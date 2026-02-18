import mongoose, { Schema, Document } from 'mongoose';

export interface IConsentRecord extends Document {
    merchantId: mongoose.Types.ObjectId;
    customerPhone: string;
    consentType: string;
    granted: boolean;
    metadata?: any;
    createdAt: Date;
}

const ConsentRecordSchema: Schema = new Schema({
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
    customerPhone: { type: String, required: true },
    consentType: { type: String, required: true },
    granted: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

ConsentRecordSchema.index({ customerPhone: 1, consentType: 1 });

export const ConsentRecordModel = mongoose.model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);
