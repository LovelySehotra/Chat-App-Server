import { genSalt, hash } from "bcrypt";
import { type } from "express/lib/response";
import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
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
        required: false
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
        blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }]

    },
    isAvatar: { type: Boolean, default: false },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
    contacts: [{ type: Schema.Types.ObjectId, ref: "User" }],
    allChats: [{ type: Schema.Types.ObjectId, ref: "User" }],
    favoritesChat: [{ type: Schema.Types.ObjectId, ref: "User" }],
    socketId: String,
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

const ChatSchema = new Schema({
    chatWithin: [{
        type: Schema.Types.ObjectId, ref: "User", required: true
    }]
    ,
    message: [{
        timestamps: { type: Date, default: Date.now },
        message: {
            file: {
                type: {
                    type: String,
                },
                name: {
                    type: String,
                },
                size: {
                    type: Number,
                },
            },
            text:{
                type:String
            },
            links:[
                {
                    type:String
                }
            ]
        },
        sender:{type:Schema.Types.ObjectId,ref:"User",required:true},
        receiver:{type:Schema.Types.ObjectId,ref:"User",required:true},
        replyMessage:{
            to:{type:Schema.Types.ObjectId,ref:"User"},
            message:{
                file: {
                    type: {
                        type: String,
                    },
                    name: {
                        type: String,
                    },
                    size: {
                        type: Number,
                    },
                },
                text:{
                    type:String
                }
            }
        }
    }],
    isMessageSeen: { type: Boolean, default: false }
})
// userSchema.pre("save", async function (next) {
//     const salt = await genSalt();
//     this.password = await hash(this.password, salt);
//     next()
// })
const User = mongoose.model("User", userSchema);
export default User;