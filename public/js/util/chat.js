const chatView = document.getElementById('chatView');
const chatForm = document.getElementById('chatForm');
const msgInput = document.getElementById('msg');
const chatSend = document.getElementById('send');

chatSend.addEventListener('click', send);
chatView.scrollTop = chatView.scrollHeight;

function newUserAlert(message) {
    const msg = document.createElement('div');
    const node = document.createTextNode(`${message.username}님이 입장하셨습니다.`);
    console.log(message);
    msg.append(node);
    chatView.append(msg);
}

function send() {
    const message = msgInput.value;

    msgInput.value = '';

    const msg = document.createElement('div');
    const node = document.createTextNode(message);

    msg.append(node);
    chatView.append(msg);

    socket.emit('message', { 
        event: 'chat',
        message: message,
        name: userName
    });
}