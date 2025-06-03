import { PrismaClient, Processo as PrismaProcesso} from '../../../generated/prisma/client';
import { Processo } from '../../types/Process.type';
const prisma = new PrismaClient();


type ResponseCreate = {
    numero:string,
    status:string,
    createdAt:Date
}

const RegisterServer = {
        create: async (processo:Processo): Promise<ResponseCreate | Error> => {
          try {
            return await prisma.processo.create({ 
                data:{
                    numero:processo.numero,
                    ReclamanteId:processo.ReclamanteId,
                    reclamada:processo.reclamada 
                },
                  select: {
                    numero: true,
                    status: true,
                    createdAt: true,
                  }
            });
          } catch (error) {
            throw new Error(`Erro ao criar registro:${error as string}`) ;
          }
        },
      
        findOne: async (id: number): Promise<ResponseCreate | {}> => {
          try {
            const Processo = await prisma.processo.findUnique({ where: { id } });
            return Processo ||{}
          } catch (error) {
            console.error(`Erro ao buscar registro com ID ${id}:`, error);
            return {};
          }
        },

        findByStatus: async (status: string): Promise<ResponseCreate | {}> => {
          try {
            const Processo = await prisma.processo.findMany({where:{status}});
            return Processo ||{}
          } catch (error) {
            console.error(`Erro ao buscar registro com status ${status}:`, error);
            return {};
          }
        },

        findAll: async (): Promise<ResponseCreate | {}> => {
          try {
            const Processo = await prisma.processo.findMany();
            return Processo ||{}
          } catch (error) {
            console.error(`Erro ao buscar registros:`, error);
            return {};
          }
        },

        findByUser: async (id: number): Promise<ResponseCreate | {}> => {
            try {
              const Processo = await prisma.processo.findMany({ where: {ReclamanteId:id } });
              return Processo ||{}
            } catch (error) {
              console.error(`Erro ao buscar registro com ID ${id}:`, error);
              return {};
            }
          },
      
 
        delete: async (id: number): Promise<Processo | Error> => {
          try {
            return await prisma.processo.delete({ where: { id } });
          } catch (error) {
            throw new Error(`Erro ao deletar registro:${error as string}`) ;
          }
        },
      
        update: async (id:number, status: string): Promise<Processo | Error> => {
          try {
            return await prisma.processo.update({
              data: {
                status: status,
              },
              where: { id:id },
            });
          } catch (error) {
            throw new Error(`Erro ao atualizar registro:${error as string}`) ;
          }
        },
}


export default RegisterServer