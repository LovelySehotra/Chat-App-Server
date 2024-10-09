import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    chatWithin: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
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
            text: {
                type: String
            },
            links: [
                {
                    type: String
                }
            ]
        },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        replyMessage: {
            to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
                text: {
                    type: String
                }
            }
        }
    }],
    isMessageSeen: { type: Boolean, default: false }
})
export const Chat = mongoose.model("Chat", chatSchema);