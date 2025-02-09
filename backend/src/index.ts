import express from "express"
import dotenv from "dotenv"
import identifyRouter from "./router/identifyRouter"
import errorHandler from "./middleware/errorHandler"

dotenv.config()
const PORT=process.env.PORT ||5000
const app=express()

app.use(express.json())

app.use("/",identifyRouter)

app.use(errorHandler)


app.listen(PORT,()=>{
    console.log(`listen in port ${PORT}`)
})