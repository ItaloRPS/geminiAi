import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();

import express, { Request,Response,NextFunction } from 'express'
import session from 'express-session';
import {RedisStore} from "connect-redis"
import login from './routes/login/login.contoller'
import user from './routes/user/user.controller'
import register from './routes/register/register.controller'
import geminiApi from './routes/gemimiApi/gemimi.contoller'

import cors from 'cors'
import passport from '../src/passaports/passaport.jwr'
import {redisStore} from '../src/util/redis/redis-client'
import { text } from 'stream/consumers';


const app = express()
const port:string|number = process.env.PORT || 3010;

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

declare module 'express-session' {
  interface SessionData {
    token?: string;
  }
}

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true}))

app.use(session({
  store: redisStore,
  secret: process.env.SECRET_SESSION||'', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Se for usar HTTPS, mude para true
}));


const publicPaths = ['/app/auth/login', '/app/user/create',];

app.use((req: Request, res: Response, next: NextFunction) => {
  if (publicPaths.includes(req.path)) {
    return next();
  }
  if(!req.session.token){
    res.status(401).send("session expired");
    return ;
  }
    passport.authenticate("jwt", { session: false })(req, res, next);
});

app.use("/app/auth",login)
app.use("/app/user",user)
app.use("/app/register",register)
app.use("/app/ia",geminiApi)


app.listen(port as number ,'0.0.0.0',() => {
  console.log(`Listening on port ${port}`)
})