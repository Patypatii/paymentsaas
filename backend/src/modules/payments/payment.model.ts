import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    merchantId: string;
    amount: number;
    currency: string;
    status: 'INITIATED' | 'STK_SENT' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    settlementStatus: 'PENDING' | 'SETTLED' | 'FAILED';
    provider: string; // e.g. 'MPESA'
    providerRef?: string;
    reference: string;
    customerPhone?: string;
    customerEmail?: string;
    description?: string;
    channelId?: mongoose.Types.ObjectId;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'KES' },
    status: {
        type: String,
        enum: ['INITIATED', 'STK_SENT', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'INITIATED'
    },
    settlementStatus: {
        type: String,
        enum: ['PENDING', 'SETTLED', 'FAILED'],
        default: 'PENDING'
    },
    provider: { type: String, required: true },
    providerRef: { type: String },
    reference: { type: String, required: true },
    customerPhone: { type: String },
    customerEmail: { type: String },
    description: { type: String },
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
    metadata: { type: Schema.Types.Mixed },
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

// Indexes
PaymentSchema.index({ merchantId: 1, createdAt: -1 });
PaymentSchema.index({ reference: 1 });
PaymentSchema.index({ providerRef: 1 });

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
