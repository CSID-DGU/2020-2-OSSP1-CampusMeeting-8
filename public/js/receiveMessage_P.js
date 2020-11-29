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
            console.log(message.event, message.userid);
            userDisconnected(message.userid);
            break;
        case 'question':
            recieveQuestion(message.studentid);
            break;
        case 'leave':
            recieveLeave(message.studentid);
            break;
        case 'leave-return':
            recieveLeaveReturn(message.studentid);
            break;
        case 'error':
            console.log(message.message);
            alert(message.message);
            location.href = '/';
            break;

    }
});