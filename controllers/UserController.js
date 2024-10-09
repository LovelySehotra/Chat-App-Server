import { User } from "../models/UserModel"



const profileUpdate = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { ...req.body }).then(() => {
        return res.status(200).send({ success: true }).catch((error) => {
            console.log(error);
            if (error.code === 11000) return res.status(406).send("Username is already used")
            return res.status(500).send("Internal Server error")
        })
    })
}
const searchProfile = async (req, res) => {
    const { query } = req.body;
    const userId = req.user._id;

    if (query === "") return res.status(200).send();
    const user = await User.find({
        $of: [
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
}
const handleContactOperations = async (req, res) => {
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