$(document).ready(function() {

   showConectar();

   $('#conectar').click(function () {
      var room = $('#room').val();

      if (!room.length) return;

      socket.emit('addToRoom', room);
      showSair();
   });

   $('#sair').click(function () {
      var room = $('#room').val();
      //Remove todas as menssagens anteriores.
      $('.message').remove();
      socket.emit('removeFromRoom', room);
      showConectar();
   });

   var socket = io('http://localhost:3000');

   function renderMessage(objMessage) {
      $('.messages').append(
         `<div class="message"><strong>${objMessage.author}: </strong>${objMessage.message}</div>`
      );
   }

   function showConectar() {
      $('.div_sair').hide();
      $('.div_conectar').show();
   }

   function showSair() {
      $('.div_conectar').hide();
      $('.div_sair').show();
   }

   $('#chat').submit(function(event) {
      event.preventDefault();

      var author = $('#username').val();
      var message = $('#message').val();
      var room = $('#room').val();

      if (!author.length || !message.length) return;

      let objMessage = {
         author,
         message,
         room
      };

      renderMessage(objMessage);

      socket.emit('sendMessage', objMessage);

      $('#message').val('');
   });

   socket.on('receivedMessage', data => {
      renderMessage(data);
   });

   socket.on('previousMessage', arrMessages => {
      for (let key in arrMessages) {
         renderMessage(arrMessages[key]);
      }
   });
});