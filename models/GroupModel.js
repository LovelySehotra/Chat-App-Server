import mongoose from "mongoose";

const groupsSchema = new mongoose.Schema({
    groupDetails: {
        name: { type: String, unique: true },
        description: { type: String },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupAdmin: { type: mongoose.Schema.Types },
    groupMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupSetting: {
        private: { type: Boolean, default: true },
        privacy: {
            isPhotoAllowed: { type: Boolean, default: true },
            isVideoAllowed: { type: Boolean, default: true },
            isVoiceAlowed: { type: Boolean, default: true },
            isAudioAllowed: { type: Boolean, default: true },
            isFileAllowed: { type: Boolean, default: true },
            isChatAllowed: { type: Boolean, default: true },
        },
    },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now },
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
})
export const Groups = mongoose.model("Group", groupsSchema);