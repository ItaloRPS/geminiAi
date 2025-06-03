
import express, {Request, Response}  from 'express'
import multer  from 'multer'
import storage  from '../../util/multer/multer-config'
import { GoogleGenerativeAI} from '@google/generative-ai';
import { GoogleAIFileManager} from '@google/generative-ai/server';
import path from 'path';

const googleAiKey = process.env.GOOGLEAI_KEY ||''
const fileManager = new GoogleAIFileManager(googleAiKey);

const upload = multer(storage)
const routes = express.Router()
const fs = require('fs');

const genAI = new GoogleGenerativeAI(googleAiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const filePath = path.resolve(__dirname, '../../../public/img/jetpack.jpg')

import register from '../register/register.service'
import user from '../user/user.service'
import { redisClient } from '../../util/redis/redis-client';


//consulta imagem que foi realizada upload
routes.post('/img', async function (req, res) {
    const prompt = "Does this look store-bought or homemade?";
    const fileId = req.body.img
    if(!fileId){
        res.status(500).send({
            error: true,
            message:  "Erro interno no servidor. Image not found!",
          });
    }
    const image = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
        mimeType: "image/jpg",
      },
    };

    const result = await model.generateContent([prompt, image]);
    res.send(result.response.text())
  })

  
  routes.get('/stream', async (req, res) => {
    try {
      // Informa ao navegador que os dados virão em partes
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
  
      const prompt = "Explique de forma simples o que é aprendizado de máquina.";
  
      // Aqui começa a geração de resposta via streaming
      const result = await model.generateContentStream(prompt);
  
      // Loop assíncrono para processar cada "chunk" de texto
      for await (const chunk of result.stream) {
        const text = chunk.text(); // Extrai o texto do pedaço
        if (text) {
          res.write(text); // Envia esse pedaço para o cliente
        }
      }
  
      // Fim do stream
      res.end();
    } catch (err) {
      console.error("Erro durante streaming:", err);
      res.status(500).send("Erro no streaming.");
    }
  });
  
  
  routes.post('/perguntas', async (req, res) => {
    try {
      const question = req.body.question;
  
      // Etapa 1: usar o Gemini para descobrir qual ação executar
      const promptSistema = `
        A seguir está uma pergunta de um usuário:
        "${question}"
  
        Diga qual tipo de dado ele quer ver:
        - Registros
        - usuario
        - login
        - desconhecido
  
        Responda só com uma palavra.
      `;
  
      const tipoResposta = await model.generateContent(promptSistema);
      const tipo = tipoResposta.response.text().trim().toLowerCase();
  
      let dados;
      if (tipo === 'registros') {
        dados = await register.findAll(); 
      } else if (tipo === 'usuario') {
        dados = await user.findAll(); 
      } else {
         res.status(400).send("Não entendi a solicitação.");
         return;
      }
  
      // Etapa 2: análise real com os dados da fonte apropriada
      const promptFinal = `
        Pergunta original do cliente:
        "${question}"
  
        Dados disponíveis:
        ${dados}
  
        Gere uma resposta útil com base na pergunta e nos dados.
      `;
      const respostaFinal = await model.generateContent(promptFinal);
      res.send(respostaFinal.response.text());
  
    } catch (error) {
      console.error("Erro ao processar a pergunta:", error);
      res.status(500).send("Ocorreu um erro interno ao processar a solicitação.");
    }
  });


  routes.post('/chat', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    try {
      const question = req.body.question;
      let textModel = []
  
      // Etapa 1: usar o Gemini para descobrir qual ação executar
      const promptSistema = `
      A seguir está uma pergunta de um usuário:
      "${question}"

      Diga qual tipo de dado ele quer ver:
      - Registros
      - usuario
      - login
      - desconhecido

      Responda só com uma palavra.
    `;
      
      const tipoResposta = await model.generateContent(promptSistema);
      const tipo = tipoResposta.response.text().trim().toLowerCase().replace(/[^\w]/g, '');
      let dados;
      if (tipo === 'registros') {
        dados = await register.findAll(); 
      } else if (tipo === 'usuario') {
        dados = await user.findAll(); 
      } else {
         res.status(400).send("Não entendi a solicitação.");
         return;
      }
  
      // Etapa 2: análise real com os dados da fonte apropriada
      const promptFinal = `
                Pergunta: "${question}"

                Aqui estão os dados disponíveis:
                ${JSON.stringify(dados, null, 2)}

                Responda com base na pergunta e nos dados acima.
                `;

          await redisClient.rPush(req.sessionID, JSON.stringify({
            role: "user",
            parts: [{ text: question }],
          }))
      const historyStrings =  await redisClient.lRange(req.sessionID, 0, 1000)
      const history = historyStrings.map(item => JSON.parse(item));
      const chat = model.startChat({history});
  
      const respFinal = await chat.sendMessageStream(promptFinal);;
      for await (const chunk of respFinal.stream) {
        const text = chunk.text(); // Extrai o texto do pedaço
        if (text) {
          textModel.push({text})
          res.write(text); // Envia esse pedaço para o cliente

        }
      }
      await redisClient.rPush(req.sessionID, JSON.stringify({
        role: "model",
        parts: textModel,
      }))
      // Mantém só os últimos 1000 elementos
      await redisClient.lTrim(req.sessionID, -1000, -1);
      // Define expiração de 1 hora (3600 segundos)
      await redisClient.expire(req.sessionID, 3600);
      res.end()
    } catch (error) {
      console.error("Erro ao processar a pergunta:", error);
      res.status(500).send("Ocorreu um erro interno ao processar a solicitação.");
    }
  });
  

//Realiza upload de imagem
routes.post('/upload',upload.fields([{ name: 'file', maxCount: 1 }]), async function (req, res) {
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "image/jpeg",
      displayName: "Jetpack drawing",
    });
    console.log(uploadResponse.file)
    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`)
    res.send(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`)
})

export default routes;
  