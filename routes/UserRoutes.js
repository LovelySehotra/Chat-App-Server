import { Router } from "express";
import { getAllChat, getChatWithinData, getProfileData, handleContactOperations, profileUpdate, searchProfile, toggleBlockContact } from "../controllers/UserController.js";

const userRoutes = new Router();

userRoutes.post("/profile/search", searchProfile);
userRoutes.post("/profile/update",profileUpdate);
userRoutes.post("/profile/:id",getProfileData);
userRoutes.use("/contact",handleContactOperations);
userRoutes.post("/handleContactOperations",handleContactOperations);
userRoutes.get("/allChats",getAllChat);
userRoutes.post("/blockContact",toggleBlockContact);
userRoutes.post("/getChatWithinData",getChatWithinData);

export default userRoutes;