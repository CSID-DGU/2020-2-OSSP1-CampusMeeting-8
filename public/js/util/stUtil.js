function addGreen(ele){
    ele.classList.add('active-green');
}
function removeGreen(ele){
    ele.classList.remove('active-green');
}

const exitRoomBtn = document.getElementById('out');
exitRoomBtn.addEventListener('click', () => {
    swal({
        title: "수업을 종료하시겠습니까?",
        text: "메인 화면으로 돌아갑니다.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((value) => {
        if (value) {
            location.href = '/main';
        }
    });
});

function closeRoom() {
    swal({
        title: "수업이 종료되었습니다.",
        text: "메인 화면으로 돌아갑니다.",
        button: "확인",
    })
    .then(() => {
        location.href = '/main';
    });
}
function handelKicked() {
    swal({
        title: "당제 퇴장 당했습니다.",
        text: "메인 화면으로 돌아갑니다.",
        button: "확인",
    })
    .then(() => {
        location.href = '/main';
    });
}
//카메라 컨트롤
const cameraBtn = document.querySelector('#camera');
let cameraOn = true;
addGreen(cameraBtn);

cameraBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    if (cameraOn) {
        cameraOn = false;
        localStream.getVideoTracks()[0].enabled = false;
        removeGreen(cameraBtn);
    } else {
        cameraOn = true;
        localStream.getVideoTracks()[0].enabled = true;
        addGreen(cameraBtn);
    }
})

//마이크 컨트롤
const micBtn = document.querySelector('#mic');
addGreen(micBtn);

const audioMode = {
    audioOn: 'audioOn',
    audioOff: 'audioOff',
}
let nowAudioMode = audioMode.audioOn;
micBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    if (nowAudioMode == audioMode.audioOn) {
        nowAudioMode = audioMode.audioOff;
        localStream.getAudioTracks()[0].enabled = false;
        removeGreen(micBtn);

    } else {
        nowAudioMode = audioMode.audioOn;
        localStream.getAudioTracks()[0].enabled = true;
        addGreen(micBtn);
    }
})
//전체 음소거
function handleSilence(){
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    if (nowAudioMode == audioMode.audioOn) {
        nowAudioMode = audioMode.audioOff;
        localStream.getAudioTracks()[0].enabled = false;
        removeGreen(micBtn);
    }
}

function micON(speakerid) {
    if (speakerid === socket.id) {
        console.log('mic on');
        if (nowAudioMode === audioMode.audioOff) {
            nowAudioMode = audioMode.audioOn;
            let localStream = participants[socket.id].rtcPeer.getLocalStream();
            localStream.getAudioTracks()[0].enabled = true;
            addGreen(micBtn);
        }
    }
}

const questionBtn = document.querySelector('#question');
questionBtn.addEventListener('click', () => {
    socket.emit('message', {
        event: 'question',
        roomid: ROOM_ID
    })

})

const leaveBtn = document.querySelector('#leave');
leaveBtn.addEventListener('click', () => {
    socket.emit('message', {
        event: 'leave',
        roomid: ROOM_ID,
        username: USER_NAME,
    })
})

function leaveAccept() {
    const template =
        `
    <div id="name-box"></div>
    <div id="time-box"></div>
    <button id="return-button">복귀하기</button>`;
    const container = document.createElement('div');
    container.id = 'popup-leave';
    container.innerHTML = template;
    document.body.appendChild(container);

    const timeBox = container.querySelector('#time-box');
    let time = 600, min, sec;
    let setfunc = setInterval(() => {
        min = parseInt(time / 60);
        sec = time % 60;
        if (min < 10) {
            min = '0' + min;
        }
        timeBox.innerHTML = min + ':' + sec;
        time--;
        if (time < 0) {
            clearInterval(setfunc);
        }
    }, 1000)

    const returnBtn = container.querySelector('#return-button');
    returnBtn.addEventListener('click', () => {
        clearInterval(setfunc);
        document.body.removeChild(container);
        socket.emit('message', {
            event: 'leave-return',
            roomid: ROOM_ID
        })
    })
}

function questionAccept(){
    if (nowAudioMode === audioMode.audioOff) {
        nowAudioMode = audioMode.audioOn;
        let localStream = participants[socket.id].rtcPeer.getLocalStream();
        localStream.getAudioTracks()[0].enabled = true;
        addGreen(micBtn);
    }
}

function  handleBanChat(){
    const msg=document.getElementById('msg').disabled=true;
    console.log('banChat');
}