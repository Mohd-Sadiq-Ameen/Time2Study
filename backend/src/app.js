import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();

const app = express()

console.log("CORS ORIGIN : " , process.env.CORS_ORIGIN);


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true // should be true , false bec of testing purposes
}))


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'

app.use("/api/v1/users", userRouter)


export { app }