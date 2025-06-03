import { PrismaClient} from '../../../generated/prisma/client';
import { Login } from '../../types/login.type';
import { User } from '../../types/user.type';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();



const UserServer = {
  create: async (user: User & Login): Promise<User | Error> => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    try {
      return await prisma.user.create({
        data:{
            email:user.email,
            name:user.name,
            Login:{
                create:{
                    password:hashedPassword
                }
            }
        }
      });
    } catch (error) {
      throw new Error(`Erro ao criar usuário:${error as string}`) ;
    }
  },

  findOne: async (id: number):Promise<User | {}> => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user ?? {};
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${id}:`, error);
      return {};
    }
  },

  findAll: async ():Promise<User[] | []>=> {
    try {
        const user = await prisma.user.findMany();
        return user ?? [];
    } catch (error) {
      console.error(`Erro ao buscar usuários:`, error);
      return [];
    }
  },

  findOneByMail: async (email: string): Promise<User | {}>  => {
    try {
      const user =  await prisma.user.findUnique({ where: { email } });
      return user ?? {};
    } catch (error) {
      console.error(`Erro ao buscar usuário com e-mail ${email}:`, error);
      return {};
    }
  },

  delete: async (id: number): Promise<User | Error> => {
    try {
      return await prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new Error(`Erro ao deletar usuário:${error as string}`) ;
    }
  },

  update: async (user: Partial<User> & { id: number }): Promise<User | Error> => {
    try {
      return await prisma.user.update({
        data: {
          name: user.name,
        },
        where: { id: user.id },
      });
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário:${error as string}`) ;
    }
  },
};

export default UserServer;
