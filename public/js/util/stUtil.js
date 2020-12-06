const cameraBtn = document.querySelector('#camera');
let cameraOn = true;
console.log(cameraBtn);
cameraBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    console.log(cameraOn);
    if (cameraOn) {
        cameraOn = false;
        localStream.getVideoTracks()[0].enabled = false;
    } else {
        cameraOn = true;
        localStream.getVideoTracks()[0].enabled = true;
    }
})

const questionBtn = document.querySelector('#question');
questionBtn.addEventListener('click', () => {
    socket.emit('message', {
        event: 'question',
        roomid: ROOM_ID
    })

})

const leaveBtn = document.querySelector('#leave');
leaveBtn.addEventListener('click', () => {
    console.log('leave clicked');
    socket.emit('message', {
        event: 'leave',
        roomid: ROOM_ID
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
