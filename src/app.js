new Vue({
    el: "#app-vue",
    data: {
        username: "",
        room: "",
        arrMessages: [],
        message: "",
        socketIO: null,
        isConectado: false,
        arrPeoplesConnected: []
    },

    computed: {

    },

    methods: {

        conectarNaSala() {
            if (!this.room.length || !this.username.length) return;

            this.socketIO.emit('addToRoom', {
                room: this.room,
                username: this.username
            });

            this.isConectado = true;
        },

        sairDaSala() {
            //Remove todas as menssagens anteriores.
            this.arrMessages = [];
            this.socketIO.emit('removeFromRoom', this.room);

            this.isConectado = false;
        },

        enviarMensagem() {
            if (!this.username.length || !this.message.length) return;

            let objMessage = {
                author: this.username,
                message: this.message,
                room: this.room
            };

            this.arrMessages.push(objMessage);

            this.socketIO.emit('sendMessage', objMessage);

            this.message = "";
        },

        setSocketIo() {
            this.socketIO = io('http://localhost:3000');

            this.socketIO.on('receivedMessage', data => {
                this.arrMessages.push(data);
            });

            this.socketIO.on('previousMessage', arrMessages => {
                this.arrMessages = arrMessages;
            });

            this.socketIO.on('updatePeoplesConnected', arrPeoplesConnected => {
                this.arrPeoplesConnected = arrPeoplesConnected
            });
        },
    },

    mounted() {
        this.setSocketIo();
    },
})