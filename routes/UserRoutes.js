import { Router } from "express";
import { searchProfile } from "../controllers/UserController.js";

const userRoutes = new Router();

userRoutes.post("/profile/search", searchProfile);

export default userRoutes;