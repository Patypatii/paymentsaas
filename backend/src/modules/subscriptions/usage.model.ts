import mongoose, { Schema, Document } from 'mongoose';

export interface IUsageTracking extends Document {
    merchantId: mongoose.Types.ObjectId;
    subscriptionId?: mongoose.Types.ObjectId;
    periodStart: Date;
    periodEnd: Date;
    transactionCount: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

const UsageTrackingSchema: Schema = new Schema({
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    transactionCount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
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

// Compound unique index for merchant + period
UsageTrackingSchema.index({ merchantId: 1, periodStart: 1 }, { unique: true });

export const UsageTrackingModel = mongoose.model<IUsageTracking>('UsageTracking', UsageTrackingSchema);
