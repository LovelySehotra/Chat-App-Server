
import mongoose from "mongoose";
import  { Schema ,model} from  "mongoose";
import bcrypt from "bcrypt"

const userSchema =  new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is Required"]
    },
    fullName: {
        type: String,
        required: true
    },
    profile: {
        privacy: {
            profilePhoto: {
                type: Boolean, default: true
            },
            about: { type: Boolean, default: true },
            status: { type: Boolean, default: true }

        },
        about: { type: String, default: "I;m using Chat App" },
        avatar: { type: String },
        blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    },
    isAvatar: { type: Boolean, default: false },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
  
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    allChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    favoritesChat: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    socketId: {String},
    status: { type: String, default: "offline" },
    lastSeen: { type: Date, default: Date.now },
    mediaStatus: [
        {
            createdAt: {
                type: Date,
                default: Date.now
            },
            type: { type: String },
            file: { type: String },
            caption: { type: String },
        },
    ],
    files: [
        {
            url: { type: String },
            type: { type: String },
            name: { type: String },
            size: { type: String },
            chat: { type: String },
            chatId: { type: String },
            timestamps: { type: Date, default: Date.now }
        }
    ]

})

const otpSchema = mongoose.Schema({
    email: { type: String },
    otp: { type: String },
    createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
    // if password is not modified return next.
    if (!this.isModified('password')) {
        return next();
    }
    // if modified then encypt and add random character
    this.password = await bcrypt.hash(this.password, 10);

})
export const User = mongoose.model("User", userSchema);


export const Otp = mongoose.model("Otp", otpSchema)