const socket = io();

socket.emit('message', {
    event: 'joinSpeakerSelectPage',
    roomid: ROOM_ID,
});

socket.on('message', message => {
    switch(message.event) {
        case 'roomInfo':
            console.log(message.participants);
            showList(message.participants);
            break;
        case 'userDisconnected':
            socket.emit('message', {
                event: 'joinSpeakerSelectPage',
                roomid: ROOM_ID,
            });
            break;
    }
});

function showList(participants) {
    for (let i in participants) {
        if (participants[i].id != socket.id) {
            const option = document.createElement('option');
            option.id = participants[i].id;
            option.innerText = participants[i].name;
            const list = document.getElementById('student-list');
            list.appendChild(option);
        }
    }
}