import { Program, IProgram, ProgramStatus } from '../models/program.model';
import { createError } from '../middleware/error-handler';

interface ProgramFilters {
  status?: ProgramStatus;
  difficulty?: string;
}

interface Pagination {
  page: number;
  limit: number;
}

export const listPrograms = async (
  filters: ProgramFilters,
  { page, limit }: Pagination
): Promise<{ programs: IProgram[]; total: number }> => {
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.difficulty) query.difficulty = filters.difficulty;

  const skip = (page - 1) * limit;
  const [programs, total] = await Promise.all([
    Program.find(query).skip(skip).limit(limit).lean(),
    Program.countDocuments(query),
  ]);

  return { programs: programs as unknown as IProgram[], total };
};

export const getProgramById = async (id: string): Promise<IProgram> => {
  const program = await Program.findById(id).lean();
  if (!program) throw createError('Program not found', 404);
  return program as unknown as IProgram;
};

interface CreateProgramDto {
  title: string;
  description: string;
  difficulty: IProgram['difficulty'];
  startDate: Date;
  endDate: Date;
  capacity: number;
  pointsOnCompletion?: number;
  price: number;
}

export const createProgram = async (
  dto: CreateProgramDto,
  adminId: string
): Promise<IProgram> => {
  const program = await Program.create({ ...dto, createdBy: adminId });
  return program;
};

export const updateProgramStatus = async (
  id: string,
  status: ProgramStatus
): Promise<IProgram> => {
  const program = await Program.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!program) throw createError('Program not found', 404);
  return program;
};
