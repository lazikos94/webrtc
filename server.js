const express = require('express');
    const app = express();
    const http = require('http');
    const server = http.createServer(app);
    const { Server } = require("socket.io");
    
    app.use(require('cors')())
    const io = new Server(server, {
        cors: {
          origin: "*",
        }
      });
    
    var rooms = []
    
    io.use((socket, next) => {
        rooms.push({username: socket.handshake.auth.username, id: socket.id});
        next()
    })
    io.on('connection', (socket) => {
    
      socket.on('incoming call', (req) => {
        const {room, caller, receiver} = req;
        const user = rooms.find(doc => doc.username === receiver);
        console.log(user)
        if(!user) return;
        socket.join(room);
        console.log(socket.adapter.rooms)
        io.to(user.id).emit('incoming call res', {room, caller, receiver})
      })
    
      socket.on('accept call', (req) => {
          // join receiver to room //
        socket.join(req.room);
        console.log(socket.adapter.rooms)
        socket.to(req.room).emit('accept call res', { room: req.room  });
      })
    
      socket.on('offer', (req) => {
          const {offer, room} = req;
          socket.to(room).emit('offer res', { room, offer });
      })
    
      socket.on('answer', (req) => {
        const {answer, room} = req;
        socket.to(room).emit('answer res', { room, answer });
      })
    
      socket.on('candidate', (req) => {
        const {candidate, room} = req;
        socket.to(room).emit('candidate res', { room, candidate });
      })
    
      socket.on('disconnect', () => {
          rooms = rooms.filter(doc => doc.id !== socket.id);
      })
    });
    
    server.listen(5000, () => {
      console.log('listening on *:5000');
    }); 