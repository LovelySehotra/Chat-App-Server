import express from "express";
import mongoose from "mongoose";
import 'dotenv/config'
// import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/AuthRoutes.js";
import { userDeserializer } from "./middleware/userDeserializer.js";


import { app,server } from "./Socket/Socket.js";
let PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userDeserializer);
app.use(cookieParser())

app.use("/api/auth",authRoutes)
server.listen(PORT, () => {
    console.log("app is listening " + `http://localhost:${PORT}`)

})

mongoose
    .connect(process.env.DB_LOCATION, {
        autoIndex: true
    })
    .then(() => console.log("DB Connecti on Successfully"))
    .catch((error) => console.log(error));