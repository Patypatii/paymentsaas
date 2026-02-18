import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
    merchantId: string;
    balance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWalletTransaction extends Document {
    walletId: string;
    merchantId: string;
    amount: number;
    type: 'TOPUP' | 'FEE' | 'BONUS' | 'REFUND';
    reference?: string; // e.g. M-Pesa Receipt or Payment ID
    description: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    metadata?: any;
    createdAt: Date;
}

const WalletSchema: Schema = new Schema({
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'KES' },
}, {
    timestamps: true
});

const WalletTransactionSchema: Schema = new Schema({
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: ['TOPUP', 'FEE', 'BONUS', 'REFUND'],
        required: true
    },
    reference: { type: String },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED'
    },
    metadata: { type: Schema.Types.Mixed },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Indexes
WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ merchantId: 1, createdAt: -1 });

export const WalletModel = mongoose.model<IWallet>('Wallet', WalletSchema);
export const WalletTransactionModel = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
