import { Chat } from "../models/ChatModel.js";
import { Groups } from "../models/GroupModel.js";
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
export const getChatWithinData = async (req, res) => {
    const { me, to } = req.body;

    try {
        const chat = await ChatModel.findOne({
            chatWithin: { $all: [me, to] },
        });

        var media = {
            images: [],
            videos: [],
            audios: [],
        };

        var files = [];
        var voices = [];

        chat?.messages.map((msg) => {
            if (msg.message.file.type === "image") {
                media.images.push(
                    `${config.server.host}/api/default/getMedia/user-${msg.sender._id}/images/${msg.message.file.name}`
                );
            }
            if (msg.message.file.type === "video") {
                media.videos.push(
                    `${config.server.host}/api/default/getMedia/user-${msg.sender._id}/videos/${msg.message.file.name}`
                );
            }
            if (msg.message.file.type === "audio") {
                media.audios.push(
                    `${config.server.host}/api/default/getMedia/user-${msg.sender._id}/audios/${msg.message.file.name}`
                );
            }
            if (msg.message.file.type === "file") {
                files.push({
                    name: msg.message.file.name,
                    url: `${config.server.host}/api/default/getMedia/user-${msg.sender._id}/files/${msg.message.file.name}`,
                    size: msg.message.file.size,
                    date: msg.timestamp,
                    format: msg.message.file.name.split(".")[1],
                });
            }
            if (msg.message.file.type === "recording") {
                voices.push({
                    name: msg.message.file.name,
                    url: `${config.server.host}/api/default/getMedia/user-${msg.sender._id}/recordings/${msg.message.file.name}.mp3`,
                    size: msg.message.file.size,
                    date: msg.timestamp,
                });
            }
        });
        const userTo = await User.findById(to, {
            _id: 1,
            username: 1,
            fullName: 1,
            isAvatar: 1,
            avatarColor: 1,
            "profile.about": 1,
            "profile.privacy.about": 1,
            "profile.privacy.profilePhoto": 1,
        });

        const {
            profile: { blockedUsers },
        } = await User.findById(me, {
            "profile.blockedUsers": 1,
        });

        const isBlocked = blockedUsers?.includes(to);

        const links = chat?.messages.flatMap((msg) =>
            msg.message.links.map((link) => link)
        );
        const modifiedData = {
            media,
            files,
            voices,
            links,
            userTo,
            isBlocked,
        };

        return res.status(200).send(modifiedData);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}
export const groupSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (query === "") return res.status(200).send([]);
        const group = await Groups.find({
            "groupDetails.name": { $regex: query, $options: "i" },

        },
            {
                _id: 1, groupDetails: 1, groupMembers: 1, groupSetting: 1
            }
        )
        const filterGroup = group.filter((group) => group.groupSetting.private === false);
        return res.status(200).send(filterGroup);
    } catch (error) {
        return res.status(406).send(error?.message);
    }
}
export const groupJoin = async (req, res) => {
   try {
     const { userId } = req.user;
     const { groupId } = req.body;
     const group = await Groups.findById({ _id: groupId });
     if (group.createdAt.toString() === userId) {
         return res.status(406).send("You can't join your own group");
 
     }
     if (group.groupMembers.includes(userId)) {
         return res.status(406).send("Already Joined");
     }
     await group.findByIdAndUpdate({
         _id: groupId,
     },
         {
             $push: {
                 groupMembers: userId
             },
         })
         return res.status(200).send("Joined");
   } catch (error) {
    return res.status(406).send(error?.message);
   }
}
export const groupCreate =async(req,res)=>{
    const userId = req.user._id;
    const upload = multer().any();
    upload(req,res,async(err)=>{
        try {
            const { groupDetails,groupMembers}= req.body;
            const { files} = req;
            const group = await Groups.create({
                groupDetails,
                groupMembers,
                createdBy:userId,
            })
            fs.mkdirSync(`src/data/group=${group._id}`,{recursive:true},(err)=>{
                if(err) console.log(err);
            })
            exec(
                `cd src/data/group-${group._id} && mkdir audios files images videos recordings`
              );    
              const filepathWithNewName = path.join(
                __dirname,
                `../data/group-${group._id}`,
                "Avatar.jpg"
              );
        
              fs.writeFile(filepathWithNewName, files[0].buffer, (err) => {
                if (err) console.log(err);
              });
              return res.status(200).send({ success: true });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(406).send("Group with same name exists");
              }
        }
    })
}
export const groupUpdate = async (req, res) => {
    const { userId } = req;
    const { groupId, update } = req.body;
  
    const isEditable = await groups.findOne({ _id: groupId, createdBy: userId });
    if (!isEditable?._id) return res.status(403).send("you can't edit");
  
    if (update.operation === "addMember") {
      const group = await groups.findById({ _id: groupId });
      group.groupMembers.push(update.data);
      group.save();
      return res.status(200).send({ message: "Member added" });
    }
  
    if (update.operation === "deleteMember") {
      const group = await groups.findById({ _id: groupId });
      group.groupMembers = group.groupMembers.filter(
        (member) => member.toString() !== update.data
      );
      group.save();
      return res.status(200).send({ message: "Member deleted" });
    }
  };