import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const requestOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, name } = req.body;
    const otp = await authService.requestOtp(phone, name);

    res.status(200).json({
      success: true,
      data: {
        message: 'OTP sent successfully',
        // Only expose OTP in non-production environments
        ...(process.env.NODE_ENV !== 'production' && { otp }),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = req.body;
    const token = await authService.verifyOtp(phone, otp);

    res.status(200).json({
      success: true,
      data: { token },
    });
  } catch (err) {
    next(err);
  }
};
