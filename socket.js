const { OrderedMap } = require("immutable");
const _ = require("lodash");
const axios = require("axios");

module.exports = (io) => {
  let userId = null;
  let userName = null;
  let connections = new OrderedMap();
  io.on("connect", (socket) => {
    socket.on("getUser", (user) => {
      userId = user._id;
      userName = user.name;
    });
    console.log(`${userName} has connected`);
    const clientConnection = {
      _id: socket.id,
      ws: socket,
      userId: userId,
    };
    // save to cache
    if (clientConnection) {
      connections = connections.set(socket.id, clientConnection);
      console.log(clientConnection.userId, "userId");
    }

    socket.on("create_channel", async (msg) => {
      try {
        const res = await axios.post(
          "http://localhost:8080/user/createChannel",
          msg
        );
        const channel = res.data;
        const members = Object.keys(msg.members);
        // send back to all user in new channel
        const users = await axios.post(
          "http://localhost:8080/user/findUserInArray",
          { members }
        );
        channel.users = users.data;
        _.each(members, (id) => {
          const memberConnection = connections.filter(
            (connect) => `${connect.userId}` === `${id}`
          );
          if (memberConnection.size) {
            memberConnection.forEach((connect) => {
              const socketId = connect._id;
              socket.to(socketId).emit("channel_added", channel);
            });
          }
        });
      } catch (err) {
        console.log(err + " ");
      }
    });

    socket.on("create_message", async (msg) => {
      try {
        await axios.post("http://localhost:8080/channel/saveMessage", msg);
        const res = await axios.post("http://localhost:8080/channel/findById", {
          channelId: msg.channelId,
        });
        const members = res.data.members;
        _.each(members, (id) => {
          const memberConnection = connections.filter((connect) => 
            `${connect.userId}` === `${id}`
          );
          //console.log(memberConnection)
          if (memberConnection.size) {
            memberConnection.forEach((connect) => {
              const socketId = connect._id;
              socket.to(socketId).emit("message_added", msg);
            });
          }
        });
      } catch (err) {
        console.log(err + " ");
      }
    });

    socket.on("disconnect", () => {
      connections = connections.remove(socket.id);
      console.log(`${userName} disconnected`);
    });
  });
};
