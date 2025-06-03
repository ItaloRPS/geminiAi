import passport, { Profile, } from 'passport'
import {Strategy as JwtStrategy , ExtractJwt} from 'passport-jwt'

const secret = process.env.SECRET;

// em caso de altenticar o token diretamente da session
// const opts = {
//     jwtFromRequest: (req: Request) => {
//       return req.session?.token;
//     },
//     secretOrKey: 'jwt_secret',
//   };


const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret||'',

}

interface Payload extends Profile{
    email?:string

}

passport.use(new JwtStrategy(opts, function(profile: Payload | null | undefined, done: (err: any, user?: any) => void) {
        if (!profile) {
           return done("erro ao validar passaport", false);
        }
        if (profile && profile.email) {
            return done(null, {role:profile.id,email:profile.email});
        } else {
            return done(null, false);
        }
}));


export default passport

