import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/MessageControler.js";

const router = Router();

router.get("/:id",getMessages);
router.post("/send/:id",sendMessage)
export default router