import mongoose, { Document, Schema } from 'mongoose';

export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProgramStatus = 'upcoming' | 'ongoing' | 'full' | 'cancelled';

export interface IProgram extends Document {
  title: string;
  description: string;
  difficulty: ProgramDifficulty;
  startDate: Date;
  endDate: Date;
  capacity: number;
  registeredCount: number;
  pointsOnCompletion: number;
  price: number;
  status: ProgramStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    pointsOnCompletion: { type: Number, default: 10, min: 0 },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'full', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  },
  { timestamps: true }
);

export const Program = mongoose.model<IProgram>('Program', programSchema);
