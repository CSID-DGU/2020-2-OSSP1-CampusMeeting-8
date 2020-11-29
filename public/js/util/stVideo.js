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
    console.log('question clicked');
    socket.emit('message', {
        event: 'question',
        roomid: ROOM_ID
    })

}) 
