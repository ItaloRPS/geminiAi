import {Processo as PrismaProcesso} from '../../generated/prisma/client';
export type Processo = Omit<PrismaProcesso, 'id'> & { id?: number, createdAt?:Date };