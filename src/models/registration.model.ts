import mongoose, { Document, Schema } from 'mongoose';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface IRegistration extends Document {
  member: mongoose.Types.ObjectId;
  program: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  rejectionReason?: string;
  pointsAwarded: number;
  registeredAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    program: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: { type: String, trim: true },
    pointsAwarded: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate registrations at the DB level
registrationSchema.index({ member: 1, program: 1 }, { unique: true });

// Alias createdAt → registeredAt for clarity in responses
registrationSchema.virtual('registeredAt').get(function () {
  return this.get('createdAt');
});

export const Registration = mongoose.model<IRegistration>('Registration', registrationSchema);
