//camera button
let cameraBtn = document.querySelector('#camera');
let screenBtn = document.querySelector('#screen');
const videoMode = {
    cameraOn: 'cameraOn',
    cameraOff: 'cameraOff',
    screenOn: 'screenOn',
    screenOff: 'screenOff'
}
let nowVideoMode = videoMode.cameraOn;


let cameraConstraint = {
    video: true
}

let screenConstraint = {
    video: {
        cursor: "always"
    },
    audio: false
};


cameraBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    let senders = participants[socket.id].rtcPeer.peerConnection.getSenders();

    switch (nowVideoMode) {
        case videoMode.cameraOn:
            nowVideoMode = videoMode.cameraOff;
            localStream.getVideoTracks()[0].enabled = false;
            //localStream.getTracks().forEach((f) => f.stop());
            break;
        case videoMode.cameraOff:
            nowVideoMode = videoMode.cameraOn;
            localStream.getVideoTracks()[0].enabled = true;
            break;
        case videoMode.screenOff: case videoMode.screenOn:
            nowVideoMode = videoMode.cameraOn;
            getCameraTrack(cameraConstraint).then(track => changeTrack(track, localStream, senders));
            break;
    }

})


screenBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    let senders = participants[socket.id].rtcPeer.peerConnection.getSenders();

    switch (nowVideoMode) {
        case videoMode.screenOff:
            nowVideoMode = videoMode.screenOn;
            localStream.getVideoTracks()[0].enabled = true;
            break;
        case videoMode.screenOn:
            nowVideoMode = videoMode.screenOff;
            localStream.getVideoTracks()[0].enabled = false;
            break;
        case videoMode.cameraOff: case videoMode.cameraOn:
            nowVideoMode = videoMode.screenOn;
            getScreenTrack(screenConstraint).then(track => changeTrack(track, localStream, senders));
            break;
    }

})

function getCameraTrack(constraint) {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia(constraint)
            .then((_stream) => {
                resolve(_stream.getVideoTracks()[0]);
            })
    })
}
function getScreenTrack(constraint) {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getDisplayMedia(constraint)
            .then((_stream) => {
                resolve(_stream.getVideoTracks()[0]);
            })
    })
}


function changeTrack(track, localStream, senders) {
    let oldTrack = localStream.getVideoTracks()[0];
    oldTrack.stop();
    console.log(oldTrack);
    localStream.removeTrack(oldTrack);
    localStream.addTrack(track);

    let sender = senders.find((s) => {
        return s.track == null;
    })
    sender.replaceTrack(track);
}

//audio controll

const micBtn = document.querySelector('#mic');
const stMicBtn = document.querySelector('#student-mic');

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
        console.log(localStream.getAudioTracks()[0].enabled);

    } else {
        nowAudioMode = audioMode.audioOn;
        localStream.getAudioTracks()[0].enabled = true;
        console.log(localStream.getAudioTracks()[0].enabled);


    }
})