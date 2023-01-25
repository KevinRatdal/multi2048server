const express = require('express')
const app = express()
const server = require('http').Server(app)
const path = require('path')
const { Server } = require('socket.io')
const cors = require('cors')
const { db } = require('./db.js')

app.use(cors())

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/highscore', (req, res) => {
  let highscores = db.getCollection('highscores')
  let data = highscores.chain().simplesort('score', true).data()
  res.json({data: data})
})

app.post('/highscore', (req, res) => {
  const data = req.body
  console.log(data)
  if (data.username && data.score) {
    let highscores = db.getCollection('highscores')
    const parsedHighscore = {username: data.username, score: data.score} 
    highscores.insert(parsedHighscore)
    res.send({status: "success", message: "Score submitted"})
  } else {
    res.send({status: "failed", message: "Failed to update database"})
  }
})


let playerMap = {}

io.on('connection', (socket) => {
  console.log('Socket: ',socket.id, socket.rooms)
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
    socket.to(room).emit('receiveGameStateUpdate', {...gameStateObject, sockId: socket.id, pName: playerMap[socket.id]})

  })

  socket.on('joinRoom', (room, pName, callback) => {
    socket.join(room)
    playerMap[socket.id] = pName
    callback(`${pName} room ${room}`)
  })

})

server.listen(3000, () => {
  console.log('listening on *:3000')
})