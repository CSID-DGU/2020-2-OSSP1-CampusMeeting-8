const userName = 'student';
const participants = {};
const hostVideo = document.getElementById('main-cam2');
const myVideo = document.getElementById('sub-cam1');
const socket = io();
let host;

const constraints = {
    audio: true,
    video: true /* {
        mandatory : {
            maxWidth : 480,
            maxFrameRate : 15,
            minFrameRate : 15
        }
    }  */
};

// 소켓 연결이 완료되면 서버로 join 메시지를 보내서 처리
socket.emit('message', {
    event: 'join',
    username: userName,
    roomid: ROOM_ID,
});

// 서버로부터의 메시지 처리
socket.on('message', message => {
    console.log('Message received: ' + message.event);

    switch (message.event) {
        case 'newParticipant':
            receiveVideo(message.userid, message.username, message.host);
            break;
        case 'existingParticipants':
            onExistingParticipants(message.userid, message.existingUsers, message.host);
            break;
        case 'receiveVideoAnswer':
            onReceiveVideoAnswer(message.senderid, message.sdpAnswer);
            break;
        case 'candidate':
            addIceCandidate(message.userid, message.candidate);
            break;
        case 'userDisconnected':
            console.log(message.event, message.userid);
            userDisconnected(message.userid);
            break;
    }
});

socket.on('warn', (message) => {
    console.log('got warn from server');
    alert(message);
})


// 유저 연결이 끊어졌을 경우 비디오 처리를 하는 메소드
function userDisconnected(userid) {
    if (participants[userid]) {
        const video = document.getElementById(userid);
        video.remove();
        delete participants[userid];
    }
}

// 원격 연결로부터 비디오 수신
function receiveVideo(userid, username, host) {
    // 페이지에 비디오 생성

    if (host === userid) {
        /* const videoContainer = makeVideoContainer(userid);
        videoGrid.appendChild(videoContainer);
        const video = videoContainer.querySelector('video');
        addCameraEvent(videoContainer, userid); */


        // 인자로 받아온 user정보를 가지고 user 생성
        const user = {
            id: userid,
            username: username,
            video: hostVideo,
            rtcPeer: null
        }

        // 참여자 리스트에 유저 추가
        participants[user.id] = user;

        const options = {
            remoteVideo: hostVideo,
            onicecandidate: onIceCandidate
        }

        // user의 rtcPeer를 생성.
        // receiveVideo는 비디오를 받아오는 역할이므로 Receive only로 생성
        user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
            function (err) {
                if (err) {
                    return console.error(err);
                }
                this.generateOffer(onOffer);
            } // offer를 생성
        );

        const onOffer = function (err, offer, wp) {
            console.log('sending offer');
            // offer를 넣은 receiveVideoFrom 메시지를 소켓을 통해 전달
            const message = {
                event: 'receiveVideoFrom',
                userid: user.id,
                roomid: ROOM_ID,
                sdpOffer: offer
            }
            sendMessage(message);
        }

        function onIceCandidate(candidate, wp) {
            console.log('sending ice candidates');
            const message = {
                event: 'candidate',
                userid: user.id,
                roomid: ROOM_ID,
                candidate: candidate
            }
            sendMessage(message);
        }
    }
}

// existingParticipants 이벤트를 수신했을 때 호출
// 새 참여자가 참여할 때마다 room의 참여자 목록을 받아서 각각의 user에 대해 receiveVideo 호출
function onExistingParticipants(userid, existingUsers, host) {/* 
    const videoContainer = makeVideoContainer(userid);

    videoGrid.appendChild(videoContainer);
    const video = videoContainer.querySelector('video');

    addCameraEvent(videoContainer, userid); */

    const user = {
        id: userid,
        username: userName,
        video: myVideo,
        rtcPeer: null
    }

    participants[user.id] = user;

    const options = {
        localVideo: myVideo,
        mediaConstraints: constraints,
        onicecandidate: onIceCandidate
    }

    // onExistingParticipants는 sendonly
    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
        function (err) {
            if (err) {
                return console.error(err);
            }
            this.generateOffer(onOffer)
        }
    );

    // exisitingUsers 목록의 모든 user들을 대상으로 receiveVideo 호출
    existingUsers.forEach(function (element) {
        receiveVideo(element.id, element.name, host);
    });

    const onOffer = function (err, offer, wp) {
        console.log('sending offer');
        const message = {
            event: 'receiveVideoFrom',
            userid: user.id,
            roomid: ROOM_ID,
            sdpOffer: offer
        }
        sendMessage(message);
    }

    function onIceCandidate(candidate, wp) {
        console.log('sending ice candidates');
        const message = {
            event: 'candidate',
            userid: user.id,
            roomid: ROOM_ID,
            candidate: candidate
        }
        sendMessage(message);
    }
}

// 서버에서 sdpAnswer를 보냈을 때 받아서 처리
function onReceiveVideoAnswer(senderid, sdpAnswer) {
    participants[senderid].rtcPeer.processAnswer(sdpAnswer);
}

// rtcPeer에 icecandidate를 추가
function addIceCandidate(userid, candidate) {
    participants[userid].rtcPeer.addIceCandidate(candidate);
}

function sendMessage(message) {
    console.log('sending ' + message.event + ' message to server');
    socket.emit('message', message);
}


function addCameraEvent(videoContainer, userid) {
    console.log(userid);
    const warn = videoContainer.querySelector('.warn-button');
    warn.addEventListener('click', (e) => {
        socket.emit('warn', {
            warnMessage: 'warning',
            userid: userid
        })
    })

}
