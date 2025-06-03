
import express, {Request, Response}  from 'express'
import passport from '../../passaports/passaport.jwr'
import jwt  from 'jsonwebtoken';
import verifyLogin from '../../middlewares/strategy/verifyLogin';
const routes = express.Router()

const options = { expiresIn: '1h' };
const secret = process.env.SECRET;
const url_login = process.env.URL_LOGIN_DIRETO;


interface CustomRequest extends Request {
    username?: string;
  }

routes.post('/login',verifyLogin,(req:CustomRequest, res:Response) => {
    try {
        const user = req.user as { email: string; name: string;};
        
    const payload = {
        email:user.email,
        name:user.name,
        role:'ADM',
    }
    const token = jwt.sign(payload, secret||'', options as Object);
        req.session.token = token
        res.status(200).send({token})
    } catch (error) {
        res.status(500).send(error);
    }
});


export default routes;