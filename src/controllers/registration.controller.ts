import { Request, Response, NextFunction } from 'express';
import * as registrationService from '../services/registration.service';
import * as gamificationService from '../services/gamification.service';

const parsePagination = (query: Request['query']) => ({
  page: Math.max(1, parseInt(query.page as string) || 1),
  limit: Math.min(100, Math.max(1, parseInt(query.limit as string) || 20)),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { programId } = req.body;
    const registration = await registrationService.register(req.user!.id, programId);
    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

export const getMyRegistrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = parsePagination(req.query);
    const { registrations, total } = await registrationService.getMyRegistrations(
      req.user!.id,
      pagination
    );
    res.status(200).json({
      success: true,
      data: registrations,
      meta: { total, page: pagination.page, limit: pagination.limit },
    });
  } catch (err) {
    next(err);
  }
};

export const cancelRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registration = await registrationService.cancelRegistration(
      req.params.id,
      req.user!.id
    );
    res.status(200).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

export const approveRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registration = await registrationService.approveRegistration(req.params.id);
    res.status(200).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

export const rejectRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const registration = await registrationService.rejectRegistration(req.params.id, reason);
    res.status(200).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

export const getMyPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await gamificationService.getPoints(req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
