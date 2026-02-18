import mongoose, { Schema, Document } from 'mongoose';

export interface AuditLogData {
    userType: 'MERCHANT' | 'ADMIN';
    userId?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}

export interface IAuditLog extends Document, AuditLogData {
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    userType: { type: String, enum: ['MERCHANT', 'ADMIN'], required: true },
    userId: { type: String },
    action: { type: String, required: true },
    resourceType: { type: String },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

// Indexes for faster querying
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
