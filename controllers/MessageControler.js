import Conversation from "../models/ConversationModel.js";
import Messgae from "../models/MessageModel.js";
import { getReceiverSocketId } from "../Socket/Socket";

export const sendMessage = async ( req,res)=>{
    try {
        const { message} = req.body;
        const { id:receiverId} = req.params;
        const senderId = req.user._id;
        let conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        });
        if(!conversation) {
            conversation = await Conversation.create({
                participants:[senderId,receiverId],
            })
        }
        const newMessage = new Messgae({
            senderId,receiverId,message
        })
        if(newMessage){
            conversation.message.push(newMessage.id);
        }
        await Promise.all[conversation.save(),newMessage.save()];
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }
        res.status(201).json(newMessage);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
        
    }
}
export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};