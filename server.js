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
let room = null;

io.on('connection', socket => {
   socket.emit('socketId', socket.id);

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
      room = data.room;

      //Recupera todas as mensagens da sala que o usuário acabou de entrar
      let arrMessagesSala = messages.filter(message => {
         return message.room == data.room && message.privateMessageId == null;
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

      //Se a mensagem contém um privateMessageId diferente de null, quer dizer que a mensagem é privada e deve ser enviada apenas para a pessoa selecionada.
      if (data.privateMessageId != null) {
         io.to(data.privateMessageId).emit('privateMessage', data);
         return;
      }

      //Emit para todos os sockets conectados a sala que o usuário está - Não emit o evento para o usuário atual só para o restante da sala;
      socket.broadcast.to(data.room).emit('receivedMessage', data);
   });

   socket.on('removeFromRoom', data => {
      socket.leave(data);
      room = null;

      //Remove a pessoa atual das pessoas conectadas a alguma sala.
      peoplesConnected = peoplesConnected.filter(people => {
         return people.socketId != socket.id
      })

      updatePeoplesConnected(data);
   });
});

io.on('disconnect', socket => {
   if (room != null) socket.leave(room);
});

server.listen(3000);