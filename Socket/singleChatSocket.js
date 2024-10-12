import { User } from "../models/UserModel.js";
import { Chat } from "../models/ChatModel.js";
class singleChatSocket {
    constructor(socket, io) {

        this.socket = socket;
        this.io = io;

        /* @Init socket @events for handles @chatMessage
        */
        this.socket.on("selectContact", this.selectContact.bind(this));
        this.socket.on("sendMessage", this.sendMessage.bind(this));
        this.socket.on("deleteMessage", this.deleteMessage.bind(this));
        this.socket.on("register", this.register.bind(this));
        this.socket.on("disconnect", this.unRegister.bind(this));
    }


    /* @functions for handle @chatMessage  */
    async selectContact(data) {
        const chats = await Chat.findOne({
            chatWithin: { $all: [data.me, data.io] },
        }, {
            message: 1
        }).populate({
            path: "message.sender message.receiver message.replyMessage.to",
            select: "fullName username avatarColor isAvatar profile.privacy.profilePhoto",
            options: { strictPopulate: false }
        })
        this.io
            .to(data.socketId)
            .emit("initialMessage", !chats ? [] : chats.messages);
    }

    async sendMessage(data) {
        const { me, to, message, replyMessage } = data;
        const { file } = message;
        var fileData = {
            size: null,
            type: null,
            name: null,
        }

        const receiver = await User.findById(to);
        const sender = await User.findById(me);
        receiver.allChats = receiver.allChats.filter((chat) => chat.toString() !== me);
        receiver.allChats.unshift(me);
        await receiver.save();

        sender.allChats = sender.allChats.filter((chat) => chat.toString() !== to);
        sender.allChats.unshift(to);
        await sender.save();

        const receiverSocketId = receiver ? receiver.socketId : null;
        const chat = await Chat.findOne({
            chatWithin: { $all: [me, to] },
        })
        if (file.type !== "text") {
            fileData = uploadFile(file.data, me, "User")
            const folder = {
                file: "files",
                image: "images",
                video: "videos",
                audio: "audios",
                recording: "recordings",
            };
            sender.files.push({
                url: `user-${sender.id}/${folder[file.type]}/${fileData.name}`,
                size: fileData.size,
                type: file.type,
                name: fileData.name,
                chat: "single",
                chatId: me + to,
            });
            await sender.save();
            if (!chat) {
                const newMessage = await Chat.create({
                    chatWithin: [me, to],
                })
                newMessage.message.push({
                    message: {
                        file: {
                            type: fileData.type ? file.type : "text",
                            name: fileData.name,
                            size: fileData.size,
                        },
                        text: message.text,
                        links: message.links,
                    },
                    sender: me,
                    receiver: to,
                    replyMessage,
                })
                await newMessage.save();
                const populatedChat = await newMessage.populate({
                    path: "messages.sender messages.receiver messages.replyMessage.to",
                    select:
                        "fullName username avatarColor isAvatar profile.privacy.profilePhoto",
                    options: { strictPopulate: false },
                });

                this.io
                    .to(receiverSocketId)
                    .emit("receiveMessage", populatedChat.messages[0]);
                this.io
                    .to(this.socket.id)
                    .emit("receiveMessage", populatedChat.messages[0]);
                this.io
                    .to(receiverSocketId)
                    .emit("NewMessageNotification", populatedChat.messages[0]);
                return null;
            }
            chat.messages.push({
                message: {
                    file: {
                        type: fileData.type ? file.type : "text",
                        name: fileData.name,
                        size: fileData.size,
                    },
                    text: message.text,
                    links: message.links,
                },
                sender: me,
                receiver: to,
                replyMessage,
            });
            await chat.save();

            const populatedChat = await chat.populate({
                path: "chatWithin messages.sender messages.receiver messages.replyMessage.to",
                select:
                    "fullName username avatarColor isAvatar profile.privacy.profilePhoto",
                options: { strictPopulate: false },
            });

            const newMessage =
                populatedChat.messages[populatedChat.messages.length - 1];

            this.io.to(receiverSocketId).emit("receiveMessage", newMessage);
            this.io.to(this.socket.id).emit("receiveMessage", newMessage);
            this.io.to(receiverSocketId).emit("NewMessageNotification", newMessage);

        }
    }
    async deleteMessage(data) {
        const { sender, receiver, messageId } = data;
        const _receiver = await User.findById(receiver, { socketId: 1 });
        const _sender = await User.findById(sender, { socketId: 1 });
        await Chat.findOneAndUpdate(
            {
                chatWithin: { $all: [sender, receiver] },
                "messages._id": messageId,
            },
            {
                $set: {
                    "messages.$.message.text": "message deleted",
                    "messages.$.message.file.type": "del",
                    "messages.$.message.file.name": null,
                    "messages.$.message.file.size": null
                }
            },
            {
                new: true
            }
        );
        this.selectContact({
            me: sender,
            to: receiver,
            socketId: _sender.socketId,
        });

        this.selectContact({
            me: receiver,
            to: sender,
            socketId: _receiver.socketId,
        });
    }
    async register(userId) {
        const data = {
            socketId: this.socket.id,
            lastSeen: Date.now(),
            status: "online",

        };
        await User.findByIdAndUpdate(userId, data);
        this.emitStatus("online")
    }
    async unRegister() {

        const data ={
            socketId: this.socket.id,
            lastSeen:Date.now(),
            status:"offline"
        };
        await User.findByIdAndUpdate({
            socketId:this.socket.id
        },data);
        this.emitStatus("offline");

        this.socket.off("sendMessage", this.sendMessage);
        this.socket.off("deleteMessage", this.deleteMessage);
        this.socket.off("selectContact", this.selectContact);
        this.socket.off("register", this.register);

    }
    async emitStatus(status) {
        const userForSocketId = await User.findOne({ socketId: this.socket.id });
    
        const chat = await Chat.findOne(
          {
            chatWithin: { $all: [userForSocketId?._id] },
          },
          {
            chatWithin: 1,
            _id: 0,
          }
        ).populate({
          path: "chatWithin",
          select: "socketId",
        });
    
        if (chat) {
          chat.chatWithin.map((chat) => {
            this.io.to(chat.socketId).emit("status", { status });
          });
        }
      }
    


}
export default singleChatSocket;
