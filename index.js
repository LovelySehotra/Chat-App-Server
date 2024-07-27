import express from "express";
import mongoose from "mongoose";
import 'dotenv/config'
import cors from 'cors';
import cookieParser from "cookie-parser";


const server = express();
let PORT = process.env.PORT || 3000;
server.use(cors(
    {
        origin: [process.env.FRONTEND],
        credentials: true
    }
))
server.use(cookieParser())
server.use(express.json());
server.use(express.urlencoded({ extended: true }));


server.listen(PORT, () => {
    console.log("Server is listening " + `http://localhost:${PORT}`)

})

mongoose
    .connect(process.env.DB_LOCATION, {
        autoIndex: true
    })
    .then(() => console.log("DB Connecti on Successfully"))
    .catch((error) => console.log(error));