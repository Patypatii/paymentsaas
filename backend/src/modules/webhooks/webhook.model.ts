import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhook extends Document {
  merchantId: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebhookDelivery extends Document {
  webhookId: string;
  eventType: string;
  payload: any;
  status: 'SUCCESS' | 'FAILED';
  responseStatus: number;
  attemptNumber: number;
  nextRetryAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

const WebhookSchema: Schema = new Schema({
  merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
  url: { type: String, required: true },
  secret: { type: String },
  events: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.secret;
    }
  }
});

const WebhookDeliverySchema: Schema = new Schema({
  webhookId: { type: Schema.Types.ObjectId, ref: 'Webhook', required: true },
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed }, // flexible payload
  status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
  responseStatus: { type: Number, required: true },
  attemptNumber: { type: Number, default: 1 },
  nextRetryAt: { type: Date },
  deliveredAt: { type: Date },
}, {
  timestamps: true
});

// Static Helpers
WebhookSchema.statics.findByMerchant = function (merchantId: string) {
  return this.find({ merchantId, isActive: true }).sort({ createdAt: -1 });
};

export const WebhookModel = mongoose.model<IWebhook>('Webhook', WebhookSchema);
export const WebhookDeliveryModel = mongoose.model<IWebhookDelivery>('WebhookDelivery', WebhookDeliverySchema);
