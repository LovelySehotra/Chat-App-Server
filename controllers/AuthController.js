import { request, response } from "express";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";

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
        if (userExist) throw new Error("User already register")
        const user = await User.create({ email, password });
        const accessToken = createToken(email, user.id, { maxAge, secure: true, sameSize: "None" })
        // res.cookie("jwt", createToken(email, user.id, { maxAge, secure: true, sameSize: "None" }))
        return res.status(201).json({

            id: user.id,
            email: user.email,
            profileSetup: user.profileSetup,
            accessToken
        })
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
console.log(request.user)
        // const id = request.User.id
        // const user = await User.findById(id)
        // return response.status(200).json({user})
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal Server Error")
    }

}