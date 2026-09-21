import { Member } from '../models/member.model';
import { createError } from '../middleware/error-handler';
import mongoose from 'mongoose';

const LEVEL_THRESHOLDS = {
  beginner: 0,
  amateur: 100,
  pro: 500,
  master: 1500,
} as const;

type Level = keyof typeof LEVEL_THRESHOLDS;

const calculateLevel = (points: number): Level => {
  if (points >= LEVEL_THRESHOLDS.master) return 'master';
  if (points >= LEVEL_THRESHOLDS.pro) return 'pro';
  if (points >= LEVEL_THRESHOLDS.amateur) return 'amateur';
  return 'beginner';
};

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

  member.points += points;
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
