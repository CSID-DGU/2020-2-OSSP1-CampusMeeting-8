const videoGrid = document.getElementById('video-grid');

const constraints = {
    audio: true,
    video: {
        width: 640,
        framerate: 15
    }
};

let localStream;
let myVideo = document.createElement('video');
let participants = {};

const socket = io();

socket.emit('message', {
    event: 'join',
    username: USER_ID,
    roomid: ROOM_ID
}, console.log('send join message to server'));

socket.on('message', message => {
    console.log('Message:', message.event);

    switch (message.event) {
        case 'newParticipant':
            receiveVideo(message.userid, message.username);
            break;
        case 'existingParticipants':
            existingParticipants(message.userid, message.existingUsers);
            break;
        case 'receiveAnswer':
            receiveAnswer(message.calleeid, message.sdpAnswer);
            break;
        case 'candidate':
            addIceCandidate(message.userid, message.candidate);
            break;

    }
});

function receiveVideo(userid, username) {
    const video = document.createElement('video');
    video.id = userid;
    videoGrid.append(video);

    const user = {
        id: userid,
        name: username,
        video: video,
        rtcPeer: null
    }

    participants[userid] = user;

    const option = {
        remoteVideo: video,
        onicecandidate: onIceCandidate
    }

    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(option,
        function (err) {
            if (err) {
                return console.log(err);
            }
            this.generateOffer(onOffer);
        });

    const onOffer = function (err, offer, wp) {
        console.log('sending offer');
        const message = {
            event: 'receiveVideo',
            userid: user.id,
            roomid: ROOM_ID,
            sdpOffer: offer
        }
        console.log('sending ' + message.event + ' message to server');
        socket.emit('message', message);
    }

    function onIceCandidate(candidate, wp) {
        console.log('sending ice candidates');
        const message = {
            event: 'candidate',
            userid: user.id,
            roomName: ROOM_ID,
            candidate: candidate
        }
        console.log('sending ' + message.event + ' message to server');
        socket.emit('message', message);
    }
}

function existingParticipants(userid, existingUsers) {
    const video = document.createElement('video');
    video.id = userid;
    videoGrid.append(video);

    const user = {
        id: userid,
        name: userid,
        video: video,
        rtcPeer: null
    }

    participants[userid] = user;

    const option = {
        localVideo: video,
        mediaConstraints: constraints,
        onicecandidate: onIceCandidate
    }

    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(option,
        function (err) {
            if (err) {
                return console.log(err);
            }
            this.generateOffer(onOffer);
        });

    existingUsers.forEach(element => {
        receiveVideo(element.id, element.name);
    });

    const onOffer = (err, offer, wp) => {
        console.log('sending offer');
        const message = {
            event: 'receiveVideo',
            userid: user.id,
            roomid: ROOM_ID,
            sdpOffer: offer
        }
        console.log('sending ' + message.event + ' message to server');
        socket.emit('message', message);
    }

    function onIceCandidate(candidate, wp) {
        console.log('sending ice candidates');
        const message = {
            event: 'candidate',
            userid: user.id,
            roomid: ROOM_ID,
            candidate: candidate
        }
        console.log('sending ' + message.event + ' message to server');
        socket.emit('message', message);
    }
}

function receiveAnswer(senderid, sdpAnswer) {
    participants[senderid].rtcPeer.processAnswer(sdpAnswer);
}

function addIceCandidate(userid, candidate) {
    participants[userid].rtcPeer.addIceCandidate(candidate);
}