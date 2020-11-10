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
    console.log(nowVideoMode);
    if (nowVideoMode == videoMode.cameraOn) {
        nowVideoMode = videoMode.cameraOff;
        localStream.getVideoTracks()[0].enabled = false;
    }
    else if (nowVideoMode == videoMode.cameraOff) {
        nowVideoMode = videoMode.cameraOn;
        localStream.getVideoTracks()[0].enabled = true;
    }
    else if (nowVideoMode == videoMode.screenOff) {
        nowVideoMode = videoMode.cameraOn;
        let oldTrack = localStream.getVideoTracks()[0];
        localStream.removeTrack(oldTrack);
        navigator.mediaDevices.getUserMedia(cameraConstraint)
            .then((_stream) => {
                let newTrack = _stream.getVideoTracks()[0];
                localStream.addTrack(newTrack);

            })
    }
    else if (nowVideoMode == videoMode.screenOn) {
        nowVideoMode = videoMode.cameraOn;
        let oldTrack = localStream.getVideoTracks()[0];
        localStream.removeTrack(oldTrack);
        navigator.mediaDevices.getUserMedia(cameraConstraint)
            .then((_stream) => {
                let newTrack = _stream.getVideoTracks()[0];
                localStream.addTrack(newTrack);

            })
    }
})


screenBtn.addEventListener('click', () => {
    let localStream = participants[socket.id].rtcPeer.getLocalStream();

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
            navigator.mediaDevices.getDisplayMedia(screenConstraint)
                .then((_stream) => {
                    let newTrack = _stream.getVideoTracks()[0];
                    localStream.addTrack(newTrack);
                })
            break;
        }
        case videoMode.cameraOn:
            nowVideoMode = videoMode.screenOn;
            let oldTrack = localStream.getVideoTracks()[0];
            localStream.removeTrack(oldTrack);
            navigator.mediaDevices.getDisplayMedia(screenConstraint)
                .then((_stream) => {
                    let newTrack = _stream.getVideoTracks()[0];
                    localStream.addTrack(newTrack);
                })
            break;
    }
})

function getCameraTrack(constraint) {
    navigator.mediaDevices.getUserMedia(constraint)
        .then((_stream) => {
            return _stream.getVideoTracks()[0];
        })
}
function getScreenTrack(constraint) {
    navigator.mediaDevices.getDisplayMedia(constraint)
        .then((_stream) => {
            return _stream.getVideoTracks()[0];
        })
}

