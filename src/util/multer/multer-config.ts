import multer  from 'multer'
import path  from 'path'
import crypto   from 'crypto'
import { Request } from 'express'

const storage = {
    storage:multer.diskStorage({
        destination:async (req,file,cb)=>{
            // cb(null,path.resolve(__dirname,'..','..','tmp','uploads'))
  
        },
        filename:(req,file,cb)=>{
            crypto.randomBytes(16,(error,Hash)=>{
                if(error){cb(error,'')}

                const fileName = `${Hash.toString('hex')}-${file.originalname}`
                cb(null,fileName)
            })
        }
    })
}

export default storage