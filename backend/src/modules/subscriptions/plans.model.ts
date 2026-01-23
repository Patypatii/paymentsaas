import mongoose, { Schema, Document } from 'mongoose';
import { PlanType } from '../../common/constants/plans';

export interface ISubscription extends Document {
  merchantId: string;
  planId: PlanType;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
  planId: { type: String, required: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
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

// Add static helper methods to match previous interface if needed, or update consumers
// Consumers likely used SubscriptionModel.create, SubscriptionModel.findByMerchant
// Mongoose models have .create. We need findByMerchant to be a static or just a query.
SubscriptionSchema.statics.findByMerchant = function (merchantId: string) {
  return this.findOne({ merchantId, status: 'ACTIVE' }).sort({ createdAt: -1 });
};

SubscriptionSchema.statics.updateStatus = function (id: string, status: string) {
  return this.findByIdAndUpdate(id, { status }, { new: true });
};

SubscriptionSchema.statics.updatePeriod = function (id: string, periodStart: Date, periodEnd: Date) {
  return this.findByIdAndUpdate(id, {
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd
  }, { new: true });
};

export const SubscriptionModel = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
