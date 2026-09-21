import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as registrationController from '../controllers/registration.controller';

const router = Router();

// Member routes
router.post(
  '/',
  authenticate,
  [body('programId').isMongoId().withMessage('Valid program ID required')],
  validate,
  registrationController.register
);

router.get('/me', authenticate, registrationController.getMyRegistrations);
router.get('/me/points', authenticate, registrationController.getMyPoints);

router.patch('/:id/cancel', authenticate, registrationController.cancelRegistration);

// Admin routes
router.patch(
  '/:id/approve',
  authenticate,
  requireRole('admin'),
  registrationController.approveRegistration
);

router.patch(
  '/:id/reject',
  authenticate,
  requireRole('admin'),
  [body('reason').optional().isString()],
  validate,
  registrationController.rejectRegistration
);

export default router;
