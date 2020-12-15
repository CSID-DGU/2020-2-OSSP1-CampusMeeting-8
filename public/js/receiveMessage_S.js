// 서버로부터의 메시지 처리
socket.on('message', message => {
    console.log('Message received: ' + message.event);

    switch (message.event) {
        case 'newUserJoined':
            newUserAlert(message);
            if (message.hostid === message.userid) {
                host = message.hostid;
                receiveVideo(message.userid, message.username);
            }
            break;
        case 'connected':
            host = message.hostid;
            connectPeer(message.userid, message.existingUsers);
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
        case 'warn':
            swal(message.warnMessage, 'warning', 'warning');
            break;
        case 'kicked':
            window.location.replace("http://www.w3schools.com");//밴페이지로 변경
            break;
        case 'leave-accept':
            leaveAccept();
            break;
        case 'micON':
            micON(message.speakerid);
            break;
    }
});