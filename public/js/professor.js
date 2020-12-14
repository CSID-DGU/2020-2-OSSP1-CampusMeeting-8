const myVideo = document.getElementById('my-cam');
const userName = USER_NAME;
const participants = {};
const videoGrid = document.getElementById('video-grid');

const socket = io();

const constraints = {
    audio: true,
    video: {
        mandatory : {
            maxWidth : 360,
            maxFrameRate : 30,
            minFrameRate : 15
        }
    }
};

// 소켓 연결이 완료되면 서버로 join 메시지를 보내서 처리
socket.emit('message', {
    event: 'join',
    isHost: true,
    username: userName,
    roomid: ROOM_ID,
});

// 유저 연결이 끊어졌을 경우 비디오 처리를 하는 메소드
function userDisconnected(userid) {
    if (participants[userid]) {
        const video = document.getElementById(userid);
        video.parentElement.remove();
        delete participants[userid];
    }
    const msg = document.createElement('div');
    const node = document.createTextNode(`${userid}님이 퇴장하셨습니다.`);
    msg.append(node);
    chatView.append(msg);
}

// 원격 연결로부터 비디오 수신
function receiveVideo(userid, username) {
    // 페이지에 비디오 생성
    const user = {
        id: userid,
        username: username,
        rtcPeer: null
    }
    participants[user.id] = user;
    const videoContainer = makeVideoContainer(user.id, user.username);
    videoGrid.appendChild(videoContainer);
    const video = videoContainer.querySelector('video');
    participants[user.id].video = video;

    const options = {
        remoteVideo: video,
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
        // offer를 넣은 메시지를 소켓을 통해 전달
        const message = {
            event: 'offer',
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

// existingParticipants 이벤트를 수신했을 때 호출
// 새 참여자가 참여할 때마다 room의 참여자 목록을 받아서 각각의 user에 대해 receiveVideo 호출
function connect(userid, existingUsers) {

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
                user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly({
                    localVideo: myVideo,
                    mediaConstraints: {
                        audio: false,
                        video: false
                    },
                    onicecandidate: onIceCandidate
                });
                //return console.error(err);
            }
            this.generateOffer(onOffer);
        }
    );

    // exisitingUsers 목록의 모든 user들을 대상으로 receiveVideo 호출
    existingUsers.forEach(function (element) {
        receiveVideo(element.id, element.name);
    });

    const onOffer = function (err, offer, wp) {
        console.log('sending offer');
        const message = {
            event: 'offer',
            userid: user.id,
            roomid: ROOM_ID,
            isHost: true,
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
function addSdpAnswer(senderid, sdpAnswer) {
    participants[senderid].rtcPeer.processAnswer(sdpAnswer);
}

// rtcPeer에 icecandidate를 추가
function addIceCandidate(userid, candidate) {
    participants[userid].rtcPeer.addIceCandidate(candidate);
}

// 메시지를 보내는 메서드
function sendMessage(message) {
    console.log('sending ' + message.event + ' message to server');
    socket.emit('message', message);
}

// 새 참가자가 입장하면 채팅으로 알림
function newUserAlert(message) {
    const msg = document.createElement('div');
    const node = document.createTextNode(`${message.username}님이 입장하셨습니다.`);
    console.log(message);
    msg.append(node);
    chatView.append(msg);
}
