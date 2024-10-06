import { Schema, model } from "mongoose";

const conversationSchema = new Schema({
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    message: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: []
        }
    ]
}, {
    timestamps: true
})
const Conversation = model("Conversation",conversationSchema);
export default Conversation;