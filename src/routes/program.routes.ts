import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as programController from '../controllers/program.controller';

const router = Router();

router.get('/', authenticate, programController.listPrograms);
router.get('/:id', authenticate, programController.getProgram);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('difficulty')
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid difficulty'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').isISO8601().withMessage('Valid end date required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be 0 or more'),
  ],
  validate,
  programController.createProgram
);

export default router;
