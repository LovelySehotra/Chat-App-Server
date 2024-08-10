import express from "express";
import mongoose from "mongoose";
import 'dotenv/config'
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/AuthRoutes.js";
import { userDeserializer } from "./middleware/userDeserializer.js";


const server = express();
let PORT = process.env.PORT || 3000;
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors(
    {
        origin: [process.env.FRONTEND],
        credentials: true,
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "Authorization",
          ],
    }
))
server.use(userDeserializer);
server.use(cookieParser())

server.use("/api/auth",authRoutes)
server.listen(PORT, () => {
    console.log("Server is listening " + `http://localhost:${PORT}`)

})

mongoose
    .connect(process.env.DB_LOCATION, {
        autoIndex: true
    })
    .then(() => console.log("DB Connecti on Successfully"))
    .catch((error) => console.log(error));