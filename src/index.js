import dotenv from "dotenv"
dotenv.config({
    path:'./.env'
})
import connectDB from "./db/index.js";
import express from "express";
//const app = express()

 import {app} from './app.js'

// import express from "express";
// const app = express()
// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("ERRR: ",error);
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//              console.log(`App is listening on port ${process.env.PORT}`);
//         })"dev": "nodemon src/index.js"
//     } catch (error) {
//         console.error("ERROR :" , error)
//         throw err
//     }
    
// })

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("mongoDB connection fail",err);
})
