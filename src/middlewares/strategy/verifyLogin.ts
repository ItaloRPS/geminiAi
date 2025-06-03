import { NextFunction, Response, Request } from 'express';
import * as bcrypt from 'bcryptjs';
import login from '../../routes/login/login.service'



async function verifyLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    return;
  }

  try {
    const data = await login.findOne(email);
    if(!data){
      res.status(401).json({ message: 'Credenciais inválidas.' });
      return;
    }
    const {user} = data
    const isEqual = await bcrypt.compare(password, user.Login?.[0]?.password);
    if (!user || !isEqual) {
      res.status(401).json({ message: 'Credenciais inválidas.' });
      return;
    }

    req.user = {name:user.name, email:user.email};
    next();
  } catch (error) {
    console.error('Erro ao verificar login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

export default verifyLogin