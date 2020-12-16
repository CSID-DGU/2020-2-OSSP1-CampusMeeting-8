const participants = {};
const hostVideo = document.getElementById('host-cam');
const myVideo = document.getElementById('my-cam');
const socket = io();
let host;

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
    username: USER_NAME,
    roomid: ROOM_ID,
});

// 유저 연결이 끊어졌을 경우 처리를 하는 메소드
function userDisconnected(userid) {
    // 접속 끊어진 유저가 host면 hostvideo 출력 삭제
    if (participants[userid]) {
        if (host === userid) {
            hostVideo.src = null;
        }
        const msg = document.createElement('div');
        const node = document.createTextNode(`${participants[userid]}님이 퇴장하셨습니다.`);
        msg.append(node);
        chatView.append(msg);
        delete participants[userid];
    }
}

// 원격 연결로부터 비디오 수신
function receiveVideo(userid, username) {
    // 페이지에 비디오 생성
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
function connectPeer(userid, existingUsers) {

    const user = {
        id: userid,
        username: USER_NAME,
        video: myVideo,
        rtcPeer: null
    }

    participants[user.id] = user;

    const options = {
        localVideo: myVideo,
        mediaConstraints: constraints,
        onicecandidate: onIceCandidate
    }

    // Sendonly로 다른 
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
            this.generateOffer(onOffer)
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
