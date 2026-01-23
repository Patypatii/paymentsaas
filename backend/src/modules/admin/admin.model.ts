import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
    email: string;
    passwordHash: string;
    role: 'SUPER_ADMIN' | 'OPERATIONS' | 'COMPLIANCE';
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'OPERATIONS', 'COMPLIANCE'],
        default: 'OPERATIONS'
    },
    lastLoginAt: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.passwordHash;
        }
    }
});

export const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);
