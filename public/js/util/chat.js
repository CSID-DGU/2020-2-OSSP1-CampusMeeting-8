const chatView = document.getElementById('chatView');
const chatForm = document.getElementById('chatForm');
const msgInput = document.getElementById('msg');
const chatSendBtn = document.getElementById('send');

chatSendBtn.addEventListener('click', chatSend);
chatView.scrollTop = chatView.scrollHeight;



function chatSend() {
    const message = msgInput.value;

    msgInput.value = '';

    const msg = document.createElement('div');
    const node = document.createTextNode(message);

    msg.append(node);
    chatView.append(msg);

    socket.emit('newChat', {
        message: message,
        name: userName,
        roomid: ROOM_ID
    });
}

socket.on('newChat', (message) => {
    console.log('got message ', message.message);
    const msg = document.createElement('div');
    const node = document.createTextNode(message.message);
    msg.append(node);
    chatView.append(msg);
})