const express = require('express')
const app = express()
const server = require('http').Server(app)
const path = require('path')
const { Server } = require('socket.io')
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})


io.on('connection', (socket) => {
  console.log(socket.id)
  socket.emit("serverTest", "pizza do be pretty good", 45)

  socket.on("clientTest", (...inp) => {
    console.log(inp)
  })

  socket.on('sendMessage', (messageObj, room) => {
    console.log({ messageObj, room })
    if (room === undefined || room === '') {
      socket.broadcast.emit('receiveMessage', messageObj.message)
    } else {
      socket.to(room).emit('receiveMessage', messageObj.message)
    }
  })

  socket.on('sendGameStateUpdate', (gameStateObject, room) => {
    console.log({ gameStateObject, room })
    if (room === undefined || room === '') {
      return
    }
    socket.to(room).emit('receiveGameStateUpdate', gameStateObject)

  })

  socket.on('joinRoom', (room, callback) => {
    socket.join(room)
    callback(`Joined room ${room}`)
  })

})

server.listen(3000, () => {
  console.log('listening on *:3000')
})