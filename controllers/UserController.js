import { User } from "../models/UserModel"



const profileUpdate = async(req,res)=>{
    await User.findByIdAndUpdate(req.body._id)
}