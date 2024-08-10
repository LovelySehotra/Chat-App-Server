import {Router} from "express";
import { login, register,getCurrentUser } from "../controllers/AuthController.js";

const authRoutes = Router();
authRoutes.post("/signup",register);
authRoutes.post("/login",login);
authRoutes.get("/userInfo",getCurrentUser);

export default authRoutes