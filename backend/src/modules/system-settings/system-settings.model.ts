import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
    key: string;
    value: any;
    updatedAt: Date;
    updatedBy?: string;
}

const SystemSettingSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export const SystemSettingModel = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
