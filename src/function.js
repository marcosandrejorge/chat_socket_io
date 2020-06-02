$(document).ready(function() {
   var socket = io('http://localhost:3000');

   function renderMessage(objMessage) {
      $('.messages').append(
         `<div class="message"><strong>${objMessage.author}: </strong>${objMessage.message}</div>`
      );
   }

   $('#chat').submit(function(event){
      event.preventDefault();

      var author = $('#username').val();
      var message = $('#message').val();

      if (!author.length || !message.length) return;

      let objMessage = {
         author,
         message
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