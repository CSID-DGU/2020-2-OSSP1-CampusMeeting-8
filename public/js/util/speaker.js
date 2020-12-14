const socket = io();
const studentList = document.getElementById('student-list');
const selectBtn = document.getElementById('select-button');

socket.emit('message', {
    event: 'joinSpeakerSelectPage',
    roomid: ROOM_ID,
});

socket.on('message', message => {
    console.log(message);
    switch(message.event) {
        case 'roomInfo':
            console.log(message.participants);
            showList(message.participants);
            break;

        case 'newUserJoined':
            const user = {
                id: message.userid,
                name: message.username,
            }
            addOption(user);
            break;

        case 'userDisconnected':
            deleteOption(message.userid);
            break;

        case 'error':
            console.log('error');
            swal(message.message, 'warning', 'warning')
            .then(isConfirm => {
                if (isConfirm) {
                    location.href = '/main';
                } else {
                    location.href = '/main';
                }
            });
            break;
    }
});

function showList(participants) {
    for (let i in participants) {
        if (participants[i].id != socket.id) {
            const option = document.createElement('option');
            option.id = participants[i].id;
            option.value = participants[i].name;
            option.innerText = participants[i].name;
            studentList.appendChild(option);
        }
    }
}

function addOption(user) {
    if (user.id != socket.id) {
        const option = document.createElement('option');
        option.id = user.id;
        option.value = user.name;
        option.innerText = user.name;
        studentList.appendChild(option);
    }
}

function deleteOption(userid) {
    if (userid != socket.id) {
        const option = document.getElementById(userid);
        studentList.removeChild(option);
    }
}

selectBtn.addEventListener('click', () => {
    const index = studentList.selectedIndex;
    const id = studentList.options[index].id;
    socket.emit('message', {
        event: 'selectSpeaker',
        roomid: ROOM_ID,
        userid: id,
    });
});