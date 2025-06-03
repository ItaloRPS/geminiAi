
import express, {Request, Response}  from 'express'
const routes = express.Router()
import user from './user.service'

routes.get('/:id', async (req, res:Response) => {
    const id = req.params.id
    try {
        const reponse = await user.findOne(parseInt(id))
        res.json(reponse)
    } catch (error) {
        res.status(500).send(error);
    }
});


routes.post('/create', async (req, res:Response) => {
    const data = req.body
    try {
        const reponse = await user.create(data)
        res.send(reponse)
    } catch (err:any) {
        res.status(500).send({
            error: true,
            message: err.message || "Erro interno no servidor",
          });
    }
});

routes.put('/update', async (req, res:Response) => {
    const data = req.body
    try {
        const reponse = await user.update(data)
        res.send(reponse)
    } catch (err:any) {
        res.status(500).send({
            error: true,
            message: err.message || "Erro interno no servidor",
          });
    }
});






// routes.post('/auth/callback',saml.authenticate("saml", {
//     failureRedirect: "/login/fail",
//   }),
//   (req, res) => {
//     const user = (req.user as any).attributes;
//     if (!user) {
//       throw new Error('User must be defined')
//     }
//     const payload = {
//       id:user.userId||'',
//       email:user.email,
//       name:`${user.firstname} ${user.lastname}`,
//       role:'ADM',
//     }
//     console.log(payload)
//     if(!secret){
//         throw new Error('JWT_KEY must be defined')
//     }
//     const token = jwt.sign(payload, secret, options as Object);
//     console.log(token)
//     res.redirect("/")
//   }
// );

export default routes;