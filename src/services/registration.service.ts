import mongoose from 'mongoose';
import { Registration, IRegistration } from '../models/registration.model';
import { Program } from '../models/program.model';
import { createError } from '../middleware/error-handler';
import { addPoints } from './gamification.service';

/**
 * Register a member for a program.
 * Uses a MongoDB transaction to atomically check capacity
 * and increment registeredCount.
 */
export const register = async (
  memberId: string,
  programId: string
): Promise<IRegistration> => {
  const session = await mongoose.startSession();

  try {
    let registration: IRegistration | null = null;

    await session.withTransaction(async () => {
      // Lock the program document for the duration of this transaction
      const program = await Program.findById(programId).session(session);
      if (!program) throw createError('Program not found', 404);

      if (!['upcoming', 'ongoing'].includes(program.status)) {
        throw createError('Program is not open for registration', 400);
      }
      if (program.registeredCount >= program.capacity) {
        throw createError('Program is at full capacity', 400);
      }

      // This will throw a duplicate key error (409) if already registered
      const [created] = await Registration.create([{ member: memberId, program: programId }], {
        session,
      });

      program.registeredCount += 1;
      if (program.registeredCount >= program.capacity) {
        program.status = 'full';
      }
      await program.save({ session });

      registration = created;
    });

    return registration!;
  } finally {
    session.endSession();
  }
};

/**
 * Admin approves a registration and awards points to the member.
 */
export const approveRegistration = async (
  registrationId: string
): Promise<IRegistration> => {
  const session = await mongoose.startSession();

  try {
    let updated: IRegistration | null = null;

    await session.withTransaction(async () => {
      const reg = await Registration.findById(registrationId)
        .populate('program')
        .session(session);
      if (!reg) throw createError('Registration not found', 404);
      if (reg.status !== 'pending') {
        throw createError(`Cannot approve a registration with status: ${reg.status}`, 400);
      }

      const program = reg.program as any;
      const points = program?.pointsOnCompletion ?? 0;

      reg.status = 'approved';
      reg.pointsAwarded = points;
      await reg.save({ session });

      if (points > 0) {
        await addPoints(reg.member.toString(), points, session);
      }

      updated = reg;
    });

    return updated!;
  } finally {
    session.endSession();
  }
};

/**
 * Admin rejects a registration with an optional reason.
 */
export const rejectRegistration = async (
  registrationId: string,
  reason?: string
): Promise<IRegistration> => {
  const reg = await Registration.findById(registrationId);
  if (!reg) throw createError('Registration not found', 404);
  if (reg.status !== 'pending') {
    throw createError(`Cannot reject a registration with status: ${reg.status}`, 400);
  }

  reg.status = 'rejected';
  if (reason) reg.rejectionReason = reason;
  await reg.save();
  return reg;
};

/**
 * Member cancels their own pending registration.
 */
export const cancelRegistration = async (
  registrationId: string,
  memberId: string
): Promise<IRegistration> => {
  const reg = await Registration.findById(registrationId);
  if (!reg) throw createError('Registration not found', 404);
  if (reg.member.toString() !== memberId) throw createError('Forbidden', 403);
  if (reg.status !== 'pending') {
    throw createError('Only pending registrations can be cancelled by members', 400);
  }

  reg.status = 'cancelled';
  await reg.save();

  // Free up the capacity slot
  await Program.findByIdAndUpdate(reg.program, {
    $inc: { registeredCount: -1 },
  });

  return reg;
};

interface Pagination {
  page: number;
  limit: number;
}

export const getMyRegistrations = async (
  memberId: string,
  { page, limit }: Pagination
): Promise<{ registrations: IRegistration[]; total: number }> => {
  const skip = (page - 1) * limit;
  const query = { member: memberId };

  const [registrations, total] = await Promise.all([
    Registration.find(query)
      .populate('program', 'title difficulty startDate status')
      .skip(skip)
      .limit(limit)
      .lean(),
    Registration.countDocuments(query),
  ]);

  return { registrations: registrations as unknown as IRegistration[], total };
};
