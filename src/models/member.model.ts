import mongoose, { Document, Schema } from 'mongoose';

export type MemberRole = 'member' | 'admin';

export interface IMember extends Document {
  name: string;
  phone: string;
  role: MemberRole;
  otp?: string;
  otpExpiresAt?: Date;
  points: number;
  level: 'beginner' | 'amateur' | 'pro' | 'master';
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    points: { type: Number, default: 0, min: 0 },
    level: {
      type: String,
      enum: ['beginner', 'amateur', 'pro', 'master'],
      default: 'beginner',
    },
  },
  { timestamps: true }
);

export const Member = mongoose.model<IMember>('Member', memberSchema);
