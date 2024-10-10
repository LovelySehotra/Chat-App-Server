import { request, response } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import { User } from "../models/UserModel.js";
import { exec } from "child_process";

let maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge })
}
export const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and Password is Required")
        }
        const userExist = await User.findOne({ email: email })
        if (!userExist) {
            const user = await User.create({...req.body});
            if(!fs.existsSync('src/data')){
                exec("mkdir -p src/data");
            }
            exec(`mkdir -p src/data/user-${user._id}`,(err,stdout ,stderr)=>{
                if(err) console.log(err);
                exec(`cd src/data/user-${user._id} && mkdir audios status files images videos recordings`)
            })
            const accessToken = createToken(email, user.id, { maxAge, secure: true, sameSize: "None" })
            return res.status(201).json({
    
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                accessToken
            })
            
        }else {
            return res.status(400).send("Username already exists");
          }
       
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}
export const login = async (request, response) => {

    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return res.status(400).send("Email and Password is Required")
        }
        const user = await User.findOne({ email: email });
        if (!user) return response.status(404).send("Email not found")
        const auth = await compare(password, user.password)
        if (!auth) return response.status(400).send("Password is incorrect.")
            const accessToken = createToken(email, user.id, { maxAge, secure: true, sameSize: "None" })
        return response.status(201).json({
            
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profileSetup: user.profileSetup,
                accessToken
            
        })
    } catch (error) {
        console.log(error);
        response.status(500).send("Internal Server Error")
    }
}
export const getCurrentUser = async(request, response)=>{
    try {
        const user = await User.findById(request.user._id)
        return response.status(200).json({ id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileSetup: user.profileSetup,})
    } catch (error) {
        console.log(error)
        response.status(500).json({error:error.message})
    }

}