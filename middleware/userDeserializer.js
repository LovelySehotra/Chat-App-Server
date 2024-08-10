import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";


export async function userDeserializer(
    request,
    response,
    next
) {
  
    const accessToken = request.headers.authorization?.split('Bearer ')[1];
    if (!accessToken) return next();
    const payload = jwt.verify(accessToken, process.env.JWT_KEY);
    const user = await User.findById(payload.userId);
    request.user = user;
    return next();
}
