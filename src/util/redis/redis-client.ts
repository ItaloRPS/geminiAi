import { RedisStore} from 'connect-redis';
import { SessionData } from 'express-session';
import { createClient } from 'redis';


const redisClient = createClient({
  url: 'redis://localhost:6379', 
});

interface Session extends SessionData{
    token?: string;
  }

redisClient.on('error', (err) => console.error('Erro no Redis:', err));

redisClient.connect();

let redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
    ttl: function (session:Session) {
        // Se o usuário está logado, TTL de 2 horas
        if (session && session.token) {
          return 60 * 60 * 2  // 2 horas em segundos
        }
        // Caso contrário, TTL de 1 minutos
        return 60;  // 1 minuto
      }
  })

export {redisClient, redisStore};