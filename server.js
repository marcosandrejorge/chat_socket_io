const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'src')));
app.set('views', path.join(__dirname, 'src'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res)=> {
   res.render('index.html');
});

let messages = [];
let peoplesConnected = [];

io.on('connection', socket => {
   //console.log(`Id conectado:${socket.id}`);

   function updatePeoplesConnected(room) {
      let peoplesRoom = peoplesConnected.filter(people => {
         return people.room == room
      });

      console.log(peoplesConnected);

      //Emit esse evento para todas as pessoas da sala, incluindo o proprio usuário do socket
      io.sockets.in(room).emit('updatePeoplesConnected', peoplesRoom);
   }

   socket.on('addToRoom', data => {
      //Entra com o usuário na sala selecionada;
      socket.join(data.room);

      //Recupera todas as mensagens da sala que o usuário acabou de entrar
      let arrMessagesSala = messages.filter(message => {
         return message.room == data.room;
      })

      //Emit para o usuário com todas as mensagens da sala;
      socket.emit('previousMessage', arrMessagesSala);

      //Adiciona a pessoa atual ao array de pessoas conectadas a alguma sala.
      peoplesConnected.push({
         username: data.username,
         socketId: socket.id,
         room: data.room
      });

      updatePeoplesConnected(data.room);
   });

   socket.on('sendMessage', data => {
      messages.push(data);
      //Emit para todos os sockets conectados a sala que o usuário está - Não emit o evento para o usuário atual só para o restante da sala;
      socket.broadcast.to(data.room).emit('receivedMessage', data);
   });

   socket.on('removeFromRoom', data => {
      socket.leave(data);

      //Remove a pessoa atual das pessoas conectadas a alguma sala.
      peoplesConnected = peoplesConnected.filter(people => {
         return people.socketId != socket.id
      })

      updatePeoplesConnected(data);
   });
});

server.listen(3000);