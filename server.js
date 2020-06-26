const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//@ Configuring os for network interface .
var os = require('os');
var ifaces = os.networkInterfaces();
//@ Configuring os for network interface

// @ Setting up static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Hashtaag Chat Assignment';

//@ Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // @ Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to Hashtaag Chat Assignment!'));

    // @ Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username} has joined the chat`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // @ Listen for chatMessage
  socket.on('chatMessage', msg => {const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // @ Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // @ Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => devURL());

// @ Function to get development time URL/ Local URL.

const devURL=() => {
    Object.keys(ifaces).forEach( (ifname) =>{
      var alias = 0;
      ifaces[ifname].forEach( (iface) => {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          return;
        }
        if (alias >= 1) {
        } else {
          var url = 'http://'+iface.address+':'+PORT+'/'
          console.log(`Dev URL: `,url);
        }
        ++alias;
      });
    });
  }