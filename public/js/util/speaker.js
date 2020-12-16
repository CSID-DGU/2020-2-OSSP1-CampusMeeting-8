const socket = io();
const studentList = document.getElementById('student-list');
const selectBtn = document.getElementById('select-button');

socket.emit('message', {
    event: 'joinSpeakerSelectPage',
    roomid: ROOM_ID,
});

socket.on('message', message => {
    console.log(message);
    switch (message.event) {
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
                .then(() => {
                    location.href = '/main'
                }
                );
            break;
    }
});

// 처음 방에 입장했을 때 방의 정보를 받아오면 유저 리스트를 출력
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

// 방에 새 유저가 접속했을 때 해당 유저의 정보를 출력
function addOption(user) {
    if (user.id != socket.id) {
        const option = document.createElement('option');
        option.id = user.id;
        option.value = user.name;
        option.innerText = user.name;
        studentList.appendChild(option);
    }
}

// 방에 있는 유저의 접속이 끊기면 해당 유저 정보를 삭제
function deleteOption(userid) {
    if (userid != socket.id) {
        const option = document.getElementById(userid);
        studentList.removeChild(option);
    }
}

selectBtn.addEventListener('click', () => {
    const index = studentList.selectedIndex;
    const id = studentList.options[index].id;
    const name = studentList.options[index].value;
    if(!id) return;
    socket.emit('message', {
        event: 'selectSpeaker',
        roomid: ROOM_ID,
        userid: id,
        username: name,
    });
});