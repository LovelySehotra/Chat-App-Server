import express from "express";
import mongoose from "mongoose";
import 'dotenv/config'
import http from "http";
// import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/AuthRoutes.js";
import { userDeserializer } from "./middleware/userDeserializer.js";
import userRoutes from "./routes/UserRoutes.js";
import socketConnection from "./Socket/Socket.js";
import { Server } from "socket.io";
let PORT = process.env.PORT || 3000;
const app = express()
const server = http.createServer(app);
export const io = new Server(server,{
    maxHttpBufferSize:1e8,
    cors:{
        origin:'*',
        methods:["GET","POST"]
    }
})
const socket = new socketConnection(io);
socket.connect();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userDeserializer);
app.use(cookieParser())

app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
server.listen(PORT, () => {
    console.log("app is listening " + `http://localhost:${PORT}`)

})

mongoose
    .connect(process.env.DB_LOCATION, {
        autoIndex: true
    })
    .then(() => console.log("DB Connection Successfully"))
    .catch((error) => console.log(error));