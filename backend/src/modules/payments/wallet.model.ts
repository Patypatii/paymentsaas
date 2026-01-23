import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
    merchantId: mongoose.Types.ObjectId;
    availableBalance: number;
    pendingBalance: number;
    totalRevenue: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

const WalletSchema: Schema = new Schema({
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true, unique: true },
    availableBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    currency: { type: String, default: 'KES' },
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

// Indexes for faster lookup
WalletSchema.index({ merchantId: 1 });

export const WalletModel = mongoose.model<IWallet>('Wallet', WalletSchema);
