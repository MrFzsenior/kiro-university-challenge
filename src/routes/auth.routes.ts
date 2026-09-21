import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/otp/request',
  [body('phone').isMobilePhone('any').withMessage('Valid phone number is required')],
  validate,
  authController.requestOtp
);

router.post(
  '/otp/verify',
  [
    body('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  ],
  validate,
  authController.verifyOtp
);

export default router;
