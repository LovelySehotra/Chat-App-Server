
// import singleChatSocket from "./singleChatSocket.js";
// import groupChatSocket from "./groupChatSocket.js";
class socketConnection {
    constructor(io){
        this.io = io;
    }
    connect() {
        this.io.on("connection", (socket) => {
        //   new singleChatSocket(socket, this.io);
        //   new groupChatSocket(socket, this.io);
        });
      }
}
// const server = http.createServer(app);
// const io = new Server(server,{
//     cors:{
//         origin:["http://localhost:3000"],
//         methods:["GET","POST"]
//     }
// })
// export const getReceiverSocketId = (receiverId)=>{
//     return userSocketMap[receiverId];
// }
// const userSocketMap ={};
// io.on("connection",(socket)=>{
//     console.log("A User connected",socket.id);
//     const userId = socket.handshake.query.userId;
//     if(userId!="undefined") userSocketMap[userId]=socket.id;
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     socket.on("disconnect", () => {
// 		console.log("user disconnected", socket.id);
// 		delete userSocketMap[userId];
// 		io.emit("getOnlineUsers", Object.keys(userSocketMap));
// 	});
// })

export default socketConnection;
