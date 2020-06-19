new Vue({
    el: "#app-vue",
    data: {
        username: "",
        socketId: null,
        room: "",
        arrMessages: [],
        message: "",
        socketIO: null,
        isConectado: false,
        arrPeoplesConnected: [],
        privateMessageId: "",
    },

    computed: {
        getPeoplesMessagePrivate() {
            return this.arrPeoplesConnected.filter(people => {
                return people.socketId != this.socketId
            });
        }
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
                room: this.room,
                privateMessageId: this.privateMessageId == "" ? null : this.privateMessageId
            };

            this.arrMessages.push(objMessage);

            this.socketIO.emit('sendMessage', objMessage);

            this.message = "";
        },

        setSocketIo() {
            this.socketIO = io('http://localhost:3000');

            this.socketIO.on('receivedMessage', message => {
                this.arrMessages.push(message);
            });

            this.socketIO.on('previousMessage', arrMessages => {
                this.arrMessages = arrMessages;
            });

            this.socketIO.on('privateMessage', message => {
                this.arrMessages.push(message);
            });

            this.socketIO.on('updatePeoplesConnected', arrPeoplesConnected => {
                this.arrPeoplesConnected = arrPeoplesConnected
            });

            this.socketIO.on('socketId', socketId => {
                this.socketId = socketId;
            })
        },
    },

    mounted() {
        this.setSocketIo();
    },
})