import { User as PrismaUser } from '../../generated/prisma';
export type User = Omit<PrismaUser, 'id'> & { id?: number };
