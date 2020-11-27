const express = require('express');
const app = require(__dirname + '/app.js');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const kurento = require('kurento-client');
const minimist = require('minimist');
const { prototype } = require('stream');
const PORT = process.env.PORT || 8843;
const router = require(__dirname + '/routes/index.js');

let kurentoClient = null;
let iceCandidateQueues = {};
let socketRoom = {};

const argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'http://localhost:8843/',
        ws_uri: 'ws://localhost:8888/kurento'
    }
});

/* const argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'http://localhost:8443/',
        ws_uri: 'ws://13.125.109.60:8888/kurento'
    }
}); */

// static 설정
app.use(express.static(__dirname + '/public'));

// view 엔진 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// 라우터
app.use('/', router);

// signaling
io.on('connection', socket => {
    console.log('a user connected');

    socket.on('message', message => {
        //console.log('Message received: ', message.event);

        switch (message.event) {
            case 'join':
                join(socket, message.username, message.roomid, message.isHost, err => {
                    if (err) {
                        console.log(err);
                    }
                });
                break;

            case 'offer':
                sendAnswer(socket, message.userid, message.roomid, message.sdpOffer, err => {
                    if (err) {
                        console.log(err);
                    }
                });
                break;

            case 'candidate':
                addIceCandidate(socket, message.userid, message.roomid, message.candidate, err => {
                    if (err) {
                        console.log(err);
                    }
                });
                break;

            case 'warn':
                console.log('warn recieved');
                io.to(message.userid).emit('message', {
                    event: 'warn',
                    warnMessage: message.warnMessage
                });
                break;

            case 'kick':
                console.log('kick recieved');
                io.to(message.userid).emit('message', {
                    event: 'kicked'
                });
                break;
        }
    });

    // socket 연결이 끊어졌을 때 (브라우저가 종료됐을 때)
    socket.on('disconnect', () => {
        console.log(`socket ${socket.id} disconnected`);
        const roomid = socketRoom[socket.id];
        handleDisconnect(socket, roomid);
    });

    socket.on('newChat', message => {
        message.name = socket.name;
        socket.to(message.roomid).emit('newChat', message);
    });

});

function join(socket, username, roomid, isHost, callback) {
    getRoom(socket, roomid, (err, myRoom) => {
        // getRoom에서 받아온 err와 myRoom
        if (err) {
            return callback(err);
        }

        if (isHost) {
            if (myRoom.host) {
                socket.emit('message', {
                    event: 'error',
                    message: '이미 개설되어 있는 방'
                });
                return;
            }
            myRoom.host = socket.id;
        }
        console.log(`host: ${myRoom.host}`);

        // myRoom의 pipeline에 WebRtcEndpoint를 추가
        myRoom.pipeline.create('WebRtcEndpoint', (err, outgoingMedia) => {
            if (err) {
                return callback(err);
            }

            // 유저 객체를 생성하고 outgoingMedia를 유저에 입력
            const user = {
                id: socket.id,
                name: username,
                outgoingMedia: outgoingMedia,
                incomingMedia: {}
            }

            // icecandidate가 존재할 경우 add
            let iceCandidateQueue = iceCandidateQueues[user.id];
            if (iceCandidateQueue) {
                while (iceCandidateQueue.length) {
                    let ice = iceCandidateQueue.shift();
                    //console.error(`user: ${user.name} collect candidate for outgoing media`);
                    user.outgoingMedia.addIceCandidate(ice.candidate);
                }
            }

            // endpoint의 OnIceCandidate event를 설정
            user.outgoingMedia.on('OnIceCandidate', event => {
                let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
                socket.emit('message', {
                    event: 'candidate',
                    userid: user.id,
                    candidate: candidate
                });
            });

            // room에 새 user가 접속했다는 메시지를 송신
            socket.to(roomid).emit('message', {
                event: 'newUserJoined',
                username: user.name,
                userid: user.id,
                hostid: myRoom.host
            });

            let existingUsers = [];
            if (isHost) {
                // existingUsers에 pariticipants들을 추가
                for (let i in myRoom.participants) {
                    if (myRoom.participants[i].id != user.id) {
                        existingUsers.push({
                            id: myRoom.participants[i].id,
                            name: myRoom.participants[i].name
                        });
                    }
                }
            } else {
                const hostid = myRoom.host;
                if (hostid) {
                    existingUsers.push({
                        id: myRoom.participants[hostid].id,
                        name: myRoom.participants[hostid].name
                    });
                }
            }

            // 현재 사용자에게 기존 참가자 목록을 묶어서 연결 이벤트를 전송
            socket.emit('message', {
                event: 'connected',
                existingUsers: existingUsers,
                userid: user.id,
                hostid: myRoom.host
            });

            // myRoom의 participants에 현재 user를 추가
            myRoom.participants[user.id] = user;
        });
    });
}

// sdpOffer를 받아서 endpoint를 얻고 sdpAnswer를 생성하여 클라이언트에 전송
function sendAnswer(socket, userid, roomid, sdpOffer, callback) {
    // getUserEndpoint를 호출해서 endpoint를 반환받음 
    getUserEndpoint(socket, roomid, userid, (err, endpoint) => {
        if (err) {
            return callback(err);
        }

        // processoffer(offer, callback) : 원격 피어에 sdpOffer를 넣고, sdpAnswer를 생성함
        endpoint.processOffer(sdpOffer, (err, sdpAnswer) => {
            if (err) {
                return callback(err);
            }

            socket.emit('message', {
                event: 'sdpAnswer',
                senderid: userid,
                sdpAnswer: sdpAnswer
            });

            // gatherCandidates(callback) : ice 후보자 수집
            // SdpEndpoint::generateOffer나 SdpEndpoint::processOffer가 실행된 이후 호출되어야 함
            endpoint.gatherCandidates(err => {
                if (err) {
                    return callback(err);
                }
            });
        });
    })
}

// iceCandidate를 받으면 반대쪽 endpoint에 추가
// 인자를 candidate 하나만 받는 mediaPipeline의 addIceCandidate (kurento 내장함수) 와 다른 함수
function addIceCandidate(socket, senderid, roomid, iceCandidate, callback) {
    let user = io.sockets.adapter.rooms[roomid].participants[socket.id];
    if (user != null) {
        let candidate = kurento.register.complexTypes.IceCandidate(iceCandidate);
        if (senderid == user.id) {
            if (user.outgoingMedia) {
                user.outgoingMedia.addIceCandidate(candidate);
            } else {
                iceCandidateQueues[user.id].push({ candidate: candidate });
            }
        } else {
            if (user.incomingMedia[senderid]) {
                user.incomingMedia[senderid].addIceCandidate(candidate);
            } else {
                if (!iceCandidateQueues[senderid]) {
                    iceCandidateQueues[senderid] = [];
                }
                iceCandidateQueues[senderid].push({ candidate: candidate });
            }
        }
        callback(null);
    } else {
        callback(new Error("addIceCandidate failed")); // user 존재하지 않으면 icecandidate 추가 불가
    }
}

// join을 호출했을 때 myRoom 객체를 만들거나 반환하는 메소드
function getRoom(socket, roomid, callback) {
    let myRoom = io.sockets.adapter.rooms[roomid] || { length: 0 };
    const numClients = myRoom.length;

    console.log(roomid, ' has ', numClients, ' clients');

    if (numClients == 0) {
        // 해당 room이 비어있으면 새 room 생성
        socket.join(roomid, () => {
            myRoom = io.sockets.adapter.rooms[roomid];
            socketRoom[socket.id] = roomid;
            getKurentoClient((error, kurento) => {
                // MediaPipeline을 생성
                kurento.create('MediaPipeline', (err, pipeline) => {
                    if (error) {
                        return callback(err);
                    }
                    // 새 room과 pipeline을 생성했으므로 참여 user는 0명
                    myRoom.pipeline = pipeline;
                    myRoom.participants = {};
                    callback(null, myRoom);
                });
            });
        });
    } else { // room이 이미 존재하면 새 room을 만들 필요 없이 room에 user를 추가
        socket.join(roomid);
        socketRoom[socket.id] = roomid;
        callback(null, myRoom);
    }
}

function getUserEndpoint(socket, roomid, senderid, callback) {
    const myRoom = io.sockets.adapter.rooms[roomid];
    const asker = myRoom.participants[socket.id];
    const sender = myRoom.participants[senderid];

    // 요청자와 송신자가 같으면 본인의 video를 반환
    if (asker.id === sender.id) {
        return callback(null, asker.outgoingMedia);
    }

    // 이미 해당 user의 video를 받았는지 중복 체크, 중복이면 sender의 incoming과 asker의 outgoing 연결
    if (asker.incomingMedia[sender.id]) {
        sender.outgoingMedia.connect(asker.incomingMedia[sender.id], err => {
            if (err) {
                return callback(err);
            }
            callback(null, asker.incomingMedia[sender.id]);
        });
    } else {
        // 없으면 endpoint 생성
        myRoom.pipeline.create('WebRtcEndpoint', (err, incoming) => {
            if (err) {
                return callback(err);
            }

            asker.incomingMedia[sender.id] = incoming;

            // icecandidate가 존재할 경우 add
            let iceCandidateQueue = iceCandidateQueues[sender.id];
            if (iceCandidateQueue) {
                while (iceCandidateQueue.length) {
                    let ice = iceCandidateQueue.shift();
                    //console.error(`user: ${sender.name} collect candidate for outgoing media`);
                    incoming.addIceCandidate(ice.candidate);
                }
            }

            // endpoint의 OnIceCandidate event를 설정
            incoming.on('OnIceCandidate', event => {
                let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
                socket.emit('message', {
                    event: 'candidate',
                    userid: sender.id,
                    candidate: candidate
                });
            });

            sender.outgoingMedia.connect(incoming, err => {
                if (err) {
                    return callback(err);
                }
                callback(null, incoming);
            });
        });
    }
}

// KurentoClient를 받아오는 함수
function getKurentoClient(callback) {
    if (kurentoClient !== null) {
        return callback(null, kurentoClient);
    }

    kurento(argv.ws_uri, (error, _kurentoClient) => {
        if (error) {
            console.log("Could not find media server at address " + argv.ws_uri);
            return callback("Could not find media server at address" + argv.ws_uri
                + ". Exiting with error " + error);
        }

        kurentoClient = _kurentoClient;
        callback(null, kurentoClient);
    });
}

// disconnect 이벤트가 발생했을 때 해당 소켓의 정보를 받아서 클라이언트에 전송하고 room의 참여자 명단에서 제거
function handleDisconnect(socket, roomid) {
    socket.to(roomid).emit('message', {
        event: 'userDisconnected',
        userid: socket.id
    });
    const myRoom = io.sockets.adapter.rooms[roomid] || { length: 0 };
    if (myRoom.length === 0) return;
    delete myRoom.participants[socket.id];
    delete socketRoom[socket.id];
    if (socket.id === myRoom.host) {
        console.log(`${roomid} room host disconnected`);
        delete myRoom.host;
    } else {
        console.log(`${socket.id} has disconnected`);
    }
}

http.listen(PORT, () => {
    console.log('Application start');
});