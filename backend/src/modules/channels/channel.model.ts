import mongoose, { Schema, Document } from 'mongoose';

export enum ChannelType {
    TILL = 'TILL',
    PAYBILL = 'PAYBILL',
    BANK = 'BANK'
}

export enum ChannelStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface IChannel extends Document {
    merchantId: mongoose.Types.ObjectId;
    name: string;
    type: ChannelType;
    number: string;
    bankName?: string;
    accountNumber?: string;
    status: ChannelStatus;
    createdAt: Date;
    updatedAt: Date;
}

const ChannelSchema: Schema = new Schema({
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
    name: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: Object.values(ChannelType),
        required: true
    },
    number: { type: String, required: true, trim: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    status: {
        type: String,
        enum: Object.values(ChannelStatus),
        default: ChannelStatus.ACTIVE
    }
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

// Ensure a merchant doesn't have duplicate channel numbers for the same type
ChannelSchema.index({ merchantId: 1, type: 1, number: 1 }, { unique: true });

export const ChannelModel = mongoose.model<IChannel>('Channel', ChannelSchema);
