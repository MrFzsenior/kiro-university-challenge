import jwt from 'jsonwebtoken';
import { Member, IMember } from '../models/member.model';
import { createError } from '../middleware/error-handler';

const OTP_LENGTH = 6;
const OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES ?? '5', 10);

/** Generate a random numeric OTP */
const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Request OTP for a phone number.
 * Creates the member if they don't exist yet.
 * Returns the OTP (in production this would be sent via SMS, not returned).
 */
export const requestOtp = async (phone: string, name?: string): Promise<string> => {
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  await Member.findOneAndUpdate(
    { phone },
    { $set: { otp, otpExpiresAt, ...(name ? { name } : {}) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // In production: send OTP via SMS here
  // For dev/demo: return it directly so it can be used in tests
  return otp;
};

/**
 * Verify OTP and return a signed JWT on success.
 */
export const verifyOtp = async (phone: string, otp: string): Promise<string> => {
  const member = await Member.findOne({ phone }).select('+otp +otpExpiresAt');
  if (!member) throw createError('Member not found', 404);
  if (!member.otp || !member.otpExpiresAt) throw createError('No OTP requested', 400);
  if (member.otpExpiresAt < new Date()) throw createError('OTP has expired', 400);
  if (member.otp !== otp) throw createError('Invalid OTP', 400);

  // Clear OTP after successful verification
  member.otp = undefined;
  member.otpExpiresAt = undefined;
  await member.save();

  return signToken(member);
};

const signToken = (member: IMember): string =>
  jwt.sign(
    { id: member._id.toString(), role: member.role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] }
  );
