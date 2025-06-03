
import express, {Request, Response}  from 'express'
const routes = express.Router()
import register from './register.service'


routes.get('/registers', async (req, res:Response) => {
    const status = req.query.status
    
    try {
        if(!status){
            const reponse = await register.findAll()
            res.json(reponse)
        }else{
            const reponse = await register.findByStatus(status as string)
            res.json(reponse)
        }
    } catch (error) {
        res.status(500).send(error);
    }
});


routes.get('/register/:id', async (req, res:Response) => {
    const id = req.params.id
    try {
        const reponse = await register.findOne(parseInt(id))
        res.json(reponse)
    } catch (error) {
        res.status(500).send(error);
    }
});


routes.post('/create', async (req, res:Response) => {
    const data = req.body
    try {
        const reponse = await register.create(data)
        res.send(reponse)
    } catch (err:any) {
        res.status(500).send({
            error: true,
            message: err.message || "Erro interno no servidor",
          });
    }
});

routes.put('/update', async (req, res:Response) => {
    const id = parseInt(req.body.id)
    const status = req.body.status
    try {
        const reponse = await register.update(id, status)
        res.send(reponse)
    } catch (err:any) {
        res.status(500).send({
            error: true,
            message: err.message || "Erro interno no servidor",
          });
    }
});


export default routes;