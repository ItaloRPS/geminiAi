import { PrismaClient} from '../../../generated/prisma/client';
import { Login } from '../../types/login.type';
import { User } from '../../types/user.type';
const prisma = new PrismaClient();

const LoginServer = {
      
        findOne: async (email:string, password:string='adm'): Promise<any | {}> => {
          try {
            return await prisma.login.findFirst({
                where:{
                    user:{
                        email:email
                    }
                },
                select:{
                   user:{select:{name:true, email:true, Login:{select:{password:true}}}},
                }
            });
          } catch (error) {
            console.error(`Erro ao email ou senha invalida:`, error);
            return {};
          }
        },
         
     
        update: async (login: Login & { userId: number }): Promise<Login | null> => {
          try {
            return await prisma.login.update({
                data: {
                    password: login.password,
                  },
                  where: {
                    userId: login.userId, 
                  },})
          } catch (error) {
            console.error(`Erro ao atualizar usuário com ID ${login.userId}:`, error);
            return null;
          }
        },
};


export default LoginServer