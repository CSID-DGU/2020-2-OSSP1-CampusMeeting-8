// 서버로부터의 메시지 처리
socket.on('message', message => {
    console.log('Message received: ' + message.event);

    switch (message.event) {
        case 'newUserJoined':
            newUserAlert(message);
            receiveVideo(message.userid, message.username);
            break;
        case 'connected':
            connect(message.userid, message.existingUsers);
            break;
        case 'sdpAnswer':
            addSdpAnswer(message.senderid, message.sdpAnswer);
            break;
        case 'candidate':
            addIceCandidate(message.userid, message.candidate);
            break;
        case 'userDisconnected':
            userDisconnected(message.userid);
            break;
        case 'question':
            changeOverMode(message.studentid, overMode.question);
            break;
        case 'leave':
            changeOverMode(message.studentid, overMode.leave);
            break;
        case 'leave-return':
            recieveLeaveReturn(message.studentid);
            break;
        case 'micON':
            micON(message.speakerid);
            break;
        case 'error':
            console.log(message.message);
            swal(message.message);
            location.href = '/';
            break;
        case 'closeRoom':
            closeRoom();
            break;
    }
});