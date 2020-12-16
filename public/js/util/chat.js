const chatView = document.getElementById('chatView');
const chatForm = document.getElementById('chatForm');
const msgInput = document.getElementById('msg');
const chatSendBtn = document.getElementById('send');

chatSendBtn.addEventListener('click', chatSend);
chatView.scrollTop = chatView.scrollHeight;
function chatSend() {
    const message = msgInput.value;
    if (!message) return;

    const today = new Date();
    const hours = today.getHours();
    const minutes = today.getMinutes();

    msgInput.value = '';
    const chat = document.createElement('div');
    chat.classList.add('my-chat');
    const msg = document.createElement('div');
    msg.classList.add('my-msg');
    const node = document.createTextNode(message);
    const nameNode = document.createElement('div');
    const nameText = `${USER_NAME} ${hours}:${minutes}`;
    nameNode.innerText = nameText;
    nameNode.classList.add('my-name');
    msg.append(node);
    chat.append(msg);
    chat.append(nameNode);
    chatView.append(chat);
    socket.emit('newChat', {
        message: message,
        username: nameText,
        roomid: ROOM_ID,
    });
}

socket.on('newChat', (message) => {
    console.log('got message:', message.message);
    const chat = document.createElement('div');
    chat.classList.add('chat');
    const msg = document.createElement('div');
    msg.classList.add('msg');
    const node = document.createTextNode(message.message);
    const nameNode = document.createElement('div');
    nameNode.innerText = message.username;
    nameNode.classList.add('name');
    msg.append(node);
    chat.append(msg);
    chat.append(nameNode);
    chatView.append(chat);
});

socket.on('systemMessage', message => {
    console.log('system message:', message.message);
    const msg = document.createElement('div');
    const node = document.createTextNode(message.message);
    msg.classLists.add('system');
    msg.append(node);
    chatView.append(msg);
})
