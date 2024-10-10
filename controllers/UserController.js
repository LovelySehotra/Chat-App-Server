import { Chat } from "../models/ChatModel.js";
import { User } from "../models/UserModel.js"



export const profileUpdate = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { ...req.body }).then(() => {
        return res.status(200).send({ success: true }).catch((error) => {
            console.log(error);
            if (error.code === 11000) return res.status(406).send("Username is already used")
            return res.status(500).send("Internal Server error")
        })
    })
}
export const searchProfile = async (req, res) => {
    try {
        const { query } = req.body;
        const userId = req.user._id;
        if (!query) return res.status(200).send();
        const user = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" }, _id: { $ne: userId } },
                { fullName: { $regex: query, $options: "i" }, _id: { $ne: userId } }
            ],
        }, {
            _id: 1,
            username: 1,
            fullName: 1,
            isAvatar: 1,
            "profile.privacy.profilePhoto": 1
        })
        return res.status(200).send(user);
    } catch (error) {
        console.log(error)
    }
}
export const handleContactOperations = async (req, res) => {
    if (req.method === "GET") {
        const userId = req.user._id;
        const { contacts } = await User.findById(userId, {
            contacts: 1,
        }).populate({
            path: "contacts",
            select: "fullName userName avatarColor isAvatar status lastSeen profile.privacy.profilePhoto"
        })
        if (contacts.length === 0) return res.status(200).send([]);
        return res.status(200).send(contacts)
    } else if (req.method === "PUT") {
        const { contactId } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (user.contacts.includes(contactId)) {
            return res.status(406).send("Already added");
        }
        user.contacts.push(contactId);
        await user.save();
        return res.status(200).send({ success: true });
    } else if (req.method === "DELETE") {
        const { contactId } = req.body;
        const userId = req.user._id;
        await User.findByIdAndUpdate({
            _id: userId
        }, {
            $pull: {
                contacts: contactId,
            }
        })
        return res.status(200).send({ success: true });
    }
}
export const populateFavorite = async (req, res) => {
    const { contacts } = req.body;
    try {
        const users = await User.find(
            { _id: { $in: contacts } },
            {
                _id: 1,
                username: 1,
                fullName: 1,
                avatarColor: 1,
                isAvatar: 1,
                status: 1,
                lastSeen: 1,
                "profile.privacy.profilePhoto": 1,
            }
        );
        return res.status(200).send(users);
    } catch (error

    ) {
        return res.status(500).send(error.message);
    }
}

export const getAllChat = async (req, res) => {
    const userId = req.user._id;
    try {
        const { allChats } = await User.findOne({
            _id: userId
        }, {
            allChats: 1,
            _id: 0,
        }).populate({
            path: "allChats",
            select: "fullName username avatarColor isAvatar profile.privacy.profilePhoto"
        })

        const modifiedChats = await Promise.all(
            allChats.map(async (user) => {
                const getMessages = await Chat.findOne({
                    chatWithin: { $all: [user.id, userId] },
                },
                    {
                        message: 1,
                        _id: 0
                    })
                return {
                    message: getMessages?.message[getMessages?.message.length - 1]?.message, user, timestamp: getMessages?.messages[getMessages?.messages.length - 1]?.timestamp,
                }
            })
        )
        if (allChats.length <= 0) {
            return res.status(200).send([]);
        }

        return res.status(200).send(modifiedChats);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
export const getProfileData = async (req, res) => {
    const userId = req.user._id;
    const { _id } = req.body;

    const me = await User.findById(userId, {
        "profile.blockedUsers": 1
    })
    const to = await User.findById(_id, {
        "profile.blockedUsers": 1
    })
    const isBlockedForMe = me?.profile?.blockedUsers?.includes(_id);
    const isBlockedForUser = me?.profile?.blockedUsers?.includes(userId);
    const user = await User.findById(_id, {
        _id: 1,
        username: 1,
        fullName: 1,
        avatarColor: 1,
        isAvatar: 1,
        status: 1,
        lastSeen: 1,
        socketId: 1,
        "profile.privacy.profilePhoto": 1,
    })
    return res
        .status(200)
        .send({ ...user.toJSON(), isBlockedForUser, isBlockedForMe });
}
export const toggleBlockContact = async (req, res) => {
    const { to, block } = req.body;
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if (block) {
            user.profile.baseModelName.push(to);
        } else {
            user.profile.blockedUsers.splice(
                user.profile.blockedUsers.indexOf(to), 1
            )
        }
        const { socketId } = await User.findById(to);
        io.to(socketId).emit("refreshBlockedUser", userId);
        user.save();
        return res.status(200).send({ success: true });
    } catch (error) {
        return res.status(500).send(error.message);
    }

}