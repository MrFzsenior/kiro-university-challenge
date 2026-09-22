import { Member } from '../models/member.model';
import { createError } from '../middleware/error-handler';
import mongoose from 'mongoose';
import { calculateLevel, applyPoints } from '../domain/leveling';

/**
 * Add points to a member and recalculate their level.
 * Accepts an optional Mongoose session for use within transactions.
 */
export const addPoints = async (
  memberId: string,
  points: number,
  session?: mongoose.ClientSession
): Promise<{ newPoints: number; newLevel: string }> => {
  const member = await Member.findById(memberId).session(session ?? null);
  if (!member) throw createError('Member not found', 404);

  member.points = applyPoints(member.points, points);
  member.level = calculateLevel(member.points);
  await member.save({ session });

  return { newPoints: member.points, newLevel: member.level };
};

/**
 * Get current points and level for a member.
 */
export const getPoints = async (
  memberId: string
): Promise<{ points: number; level: string }> => {
  const member = await Member.findById(memberId).select('points level').lean();
  if (!member) throw createError('Member not found', 404);
  return { points: member.points, level: member.level };
};
