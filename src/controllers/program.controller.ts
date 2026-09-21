import { Request, Response, NextFunction } from 'express';
import * as programService from '../services/program.service';

const parsePagination = (query: Request['query']) => ({
  page: Math.max(1, parseInt(query.page as string) || 1),
  limit: Math.min(100, Math.max(1, parseInt(query.limit as string) || 20)),
});

export const listPrograms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, difficulty } = req.query;
    const pagination = parsePagination(req.query);

    const { programs, total } = await programService.listPrograms(
      { status: status as any, difficulty: difficulty as string },
      pagination
    );

    res.status(200).json({
      success: true,
      data: programs,
      meta: { total, page: pagination.page, limit: pagination.limit },
    });
  } catch (err) {
    next(err);
  }
};

export const getProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programService.getProgramById(req.params.id);
    res.status(200).json({ success: true, data: program });
  } catch (err) {
    next(err);
  }
};

export const createProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await programService.createProgram(req.body, req.user!.id);
    res.status(201).json({ success: true, data: program });
  } catch (err) {
    next(err);
  }
};
