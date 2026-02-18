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
            const result = ret as any;
            result.id = result._id;
            delete result._id;
            delete result.__v;
            delete result.passwordHash;
        }
    }
});

export const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);
