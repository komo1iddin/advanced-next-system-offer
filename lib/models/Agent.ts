import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  description?: string;
  whatsapp?: string;
  whatsappGroup?: string;
  wechat?: string;
  wechatGroup?: string;
  telegram?: string;
  telegramGroup?: string;
  telephone?: string;
  facebookPage?: string;
  facebookGroup?: string;
  email?: string;
  website?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    whatsappGroup: { type: String, trim: true },
    wechat: { type: String, trim: true },
    wechatGroup: { type: String, trim: true },
    telegram: { type: String, trim: true },
    telegramGroup: { type: String, trim: true },
    telephone: { type: String, trim: true },
    facebookPage: { type: String, trim: true },
    facebookGroup: { type: String, trim: true },
    email: { type: String, trim: true },
    website: { type: String, trim: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'agents'
  }
);

export default mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema); 