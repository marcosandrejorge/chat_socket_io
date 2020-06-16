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

io.on('connection', socket => {
   console.log(`Id conectado:${socket.id}`);

   socket.on('addToRoom', data => {
      //Entra com o usuário na sala selecionada;
      socket.join(data);

      //Recupera todas as mensagens da sala que o usuário acabou de entrar
      let arrMessagesSala = messages.filter(message => {
         return message.room == data;
      })

      //Emit para o usuário com todas as mensagens da sala;
      socket.emit('previousMessage', arrMessagesSala);
   });

   socket.on('sendMessage', data => {
      messages.push(data);
      //Emit para todos os sockets conectados a sala que o usuário está - Não emit o evento para o usuário atual só para o restante da sala;
      socket.broadcast.to(data.room).emit('receivedMessage', data);
   });

   socket.on('removeFromRoom', data => {
      socket.leave(data);
   });
});

server.listen(3000);