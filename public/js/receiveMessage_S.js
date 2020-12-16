// 서버로부터의 메시지 처리
socket.on('message', message => {
    console.log('Message received: ' + message.event);

    switch (message.event) {
        case 'newUserJoined':
            newUserAlert(message);
            if (message.hostid === message.userid) {
                host = message.hostid;
                receiveVideo(message.userid, message.username);
            } else {
                const user = {
                    userid: message.userid,
                    username: message.username,
                }
                participants[message.userid] = user; 
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
            userDisconnected(message.userid);
            break;
        case 'warn':
            swal({
                title: "경고",
                text: "학생! 경고입니다!",
                icon: "warning",
                button: "확인",
            });
            break;
        case 'kicked':
            window.location.replace("http://www.w3schools.com");//밴페이지로 변경
            break;
        case 'leave-accept':
            leaveAccept();
            break;
        case 'question-accept':
            questionAccept();
            break;
        case 'micON':
            micON(message.speakerid);
            break;
        case 'silence':
            handleSilence();
            break;
        case 'closeRoom':
            closeRoom();
            break;
    }
});