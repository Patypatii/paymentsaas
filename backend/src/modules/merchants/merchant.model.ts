import mongoose, { Schema, Document } from 'mongoose';

export interface IMerchant extends Document {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  phoneNumber?: string;
  businessName?: string;
  settlementType?: 'PAYBILL' | 'TILL' | 'BANK_PAYBILL';
  shortcode?: string;
  tillNumber?: string;
  bankAccountNumber?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  planId: string;
  referralSource?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MerchantSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  passwordHash: { type: String, required: true },
  phoneNumber: { type: String },
  businessName: { type: String },
  settlementType: { type: String, enum: ['PAYBILL', 'TILL', 'BANK_PAYBILL'] },
  shortcode: { type: String },
  tillNumber: { type: String },
  bankAccountNumber: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'],
    default: 'PENDING'
  },
  planId: { type: String, default: 'STARTER' },
  referralSource: { type: String },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
    }
  }
});

// Static methods to mimic previous SQL model methods for easier refactoring
MerchantSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

MerchantSchema.statics.updateStatus = function (id: string, status: string) {
  return this.findByIdAndUpdate(id, { status }, { new: true });
};

export const MerchantModel = mongoose.model<IMerchant>('Merchant', MerchantSchema);
