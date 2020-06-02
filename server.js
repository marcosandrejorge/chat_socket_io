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

   //Emit só para o socket conectado;
   socket.emit('previousMessage', messages);

   socket.on('sendMessage', data => {
      messages.push(data);
      //Emit só para todos os sockets conectados;
      socket.broadcast.emit('receivedMessage', data);
   });
});

server.listen(3000);