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
    msg.style.borderRadius = "10px";
    msg.style.margin = "10px";
    msg.style.backgroundColor = "#43AAFF";
    msg.style.marginLeft = "250px";
    msg.style.color = "white"
    chatView.append(msg);
    socket.emit('newChat', {
        message: message,
        name: USER_NAME,
        roomid: ROOM_ID
    });
}

socket.on('newChat', (message) => {
    console.log('got message:', message.message);
    const msg = document.createElement('div');
    const node = document.createTextNode(`${message.name}: ${message.message}`);
    msg.append(node);
    msg.style.borderRadius = "10px";
    msg.style.margin = "10px";
    msg.style.background = "white";
    msg.style.color = "black";
    msg.style.marginRight = "250px";
    chatView.append(msg);
});

socket.on('systemMessage', message => {
    console.log('system message:', message.message);
    const msg = document.createElement('div');
    const node = document.createTextNode(`${message.name}: ${message.message}`);
    msg.append(node);
    chatView.append(msg);
})
