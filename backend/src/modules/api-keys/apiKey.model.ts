import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey extends Document {
    merchantId: string;
    keyHash: string;
    keyPrefix: string;
    name: string;
    isActive: boolean;
    lastUsedAt?: Date;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ApiKeySchema: Schema = new Schema({
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
    keyHash: { type: String, required: true },
    keyPrefix: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date },
    revokedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc: any, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.keyHash;
        }
    }
});

export const ApiKeyModel = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
