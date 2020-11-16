/* //camera button
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
    switch (nowVideoMode) {
        case videoMode.cameraOn:
            nowVideoMode = videoMode.cameraOff;
            localStream.getVideoTracks()[0].enabled = false;
            break;
        case videoMode.cameraOff:
            nowVideoMode = videoMode.cameraOn;
            localStream.getVideoTracks()[0].enabled = true;
            break;
        case videoMode.screenOff: {
            nowVideoMode = videoMode.cameraOn;
            let oldTrack = localStream.getVideoTracks()[0];
            localStream.removeTrack(oldTrack);
            getCameraTrack(cameraConstraint).then(track => localStream.addTrack(track));
            break;
        }
        case videoMode.screenOn:
            nowVideoMode = videoMode.cameraOn;
            let oldTrack = localStream.getVideoTracks()[0];
            localStream.removeTrack(oldTrack);
            getCameraTrack(cameraConstraint).then(track => localStream.addTrack(track));
            break;
    }

})


screenBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();
    console.log(participants[socket.id].rtcPeer.get());

    console.log(participants[socket.id].rtcPeer.get());
    switch (nowVideoMode) {
        case videoMode.screenOff:
            nowVideoMode = videoMode.screenOn;
            localStream.getVideoTracks()[0].enabled = true;
            break;
        case videoMode.screenOn:
            nowVideoMode = videoMode.screenOff;
            localStream.getVideoTracks()[0].enabled = false;
            break;
        case videoMode.cameraOff: {
            nowVideoMode = videoMode.screenOn;
            let oldTrack = localStream.getVideoTracks()[0];
            localStream.removeTrack(oldTrack);
            getScreenTrack(screenConstraint).then(track => localStream.addTrack(track));
            break;
        }
        case videoMode.cameraOn:
            nowVideoMode = videoMode.screenOn;
            let oldTrack = localStream.getVideoTracks()[0];
            localStream.removeTrack(oldTrack);
            getScreenTrack(screenConstraint).then(track => localStream.addTrack(track));
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

 */