const express = require('express');
const http = require('http'); // 테스트 버전에서만 http 사용
const https = require('https'); // webRTC는 https 사용
const fs = require('fs');
//const router = require(__dirname + '/routes/index.js');
const port = process.env.PORT || 8443;
const kurento = require('kurento-client');
const minimist = require('minimist');
const { v4: uuidV4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'http://localhost:8443/',
        ws_uri: 'ws://localhost:8888/kurento'
    }
}); // Kurento 서버 정보

app.use(express.static('public'));

// view 엔진 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) => {
    res.redirect('/room');
});

app.get('/room', (req, res) => {
    res.redirect(`/room/${uuidV4()}`);
});

app.get('/room/:room', (req, res) => {
    res.render('room', { roomID: req.params.room, userID: `${uuidV4()}` });
});

server.listen(port, (req, res) => {
    console.log('test');
});

let kurentoClient = null;
let iceCandidateQueues = {};

io.on('connection', socket => {
    console.log('new user connected');

    socket.on('message', message => {

        switch (message.event) {
            case 'join':
                join(socket, message.username, message.roomid, err => {
                    if (err) {
                        console.log(err);
                    }
                });
                break;
            case 'receiveVideo':
                receiveVideo(socket, message.userid, message.roomid, message.sdpOffer, err => {
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
        }
    });
});

// KurentoClient를 받아오는 함수
function getKurentoClient(callback) {
    if (kurentoClient !== null) {
        return callback(null, kurentoClient);
    }

    kurento(argv.ws_uri, function (error, _kurentoClient) {
        if (error) {
            console.log("Could not find media server at address " + argv.ws_uri);
            return callback("Could not find media server at address" + argv.ws_uri
                + ". Exiting with error " + error);
        }

        kurentoClient = _kurentoClient;
        callback(null, kurentoClient);
    });
}

function join(socket, username, roomid, callback) {
    getRoom(socket, roomid, (err, myRoom) => { // getRoom에서 받아온 err와 myRoom
        if (err) {
            return callback(err);
        }

        // myRoom의 pipeline에 WebRtcEndpoint를 추가
        myRoom.pipeline.create('WebRtcEndpoint', (err, outgoingMedia) => {
            if (err) {
                return callback(err);
            }

            // 유저를 생성하고 outgoingMedia를 유저에 입력
            const user = {
                id: socket.id,
                name: username,
                outgoingMedia: outgoingMedia,
                incomingMedia: {}
            }

            // iceCandidate가 존재할 경우 add
            let iceCandidateQueue = iceCandidateQueues[user.id];
            if (iceCandidateQueue) {
                while (iceCandidateQueue.length) {
                    let ice = iceCandidateQueue.shift();
                    console.error(`user: ${user.name} collect candidate for outgoing media`);
                    user.outgoingMedia.addIceCandidate(ice.candidate);
                }
            }

            // endpoint의 onIceCandidate event를 설정
            user.outgoingMedia.on('OnIceCandidate', event => {
                let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
                socket.emit('message', {
                    event: 'candidate',
                    userid: user.id,
                    candidate: candidate
                });
            });

            socket.to(roomid).emit('message', {
                event: 'newParticipant',
                userid: user.id,
                username: user.name
            });

            let existingUsers = [];
            // existingUsers에 participants들을 추가 (본인 제외)
            for (let i in myRoom.participants) {
                if (myRoom.participants[i].id != user.id) {
                    existingUsers.push({
                        id: myRoom.participants[i].id,
                        name: myRoom.participants[i].name
                    });
                }
            }

            socket.emit('message', {
                event: 'existingParticipants',
                existingUsers: existingUsers,
                userid: user.id
            });

            // myRoom의 participants에 현재 user를 추가
            myRoom.participants[user.id] = user;
        });
    });
}

function getRoom(socket, roomid, callback) {
    let myRoom = io.sockets.adapter.rooms[roomid] || { length: 0 };
    const numClients = myRoom.length;
    console.log(`${numClients} users in ${roomid}`);

    if (numClients === 0) {
        // 새 room 생성
        socket.join(roomid, () => {
            myRoom = io.sockets.adapter.rooms[roomid];
            getKurentoClient((error, kurento) => {
                // media pipeline 생성
                kurento.create('MediaPipeline', (err, pipeline) => {
                    if (error) {
                        return callback(err);
                    }
                    // 새 room과 pipeline을 생성했으므로 참여 user는 0명
                    myRoom.pipeline = pipeline;
                    myRoom.participants = {}; // empty
                    callback(null, myRoom);
                });
            });
        });
    } else { // room이 이미 존재하면 room에 user를 추가
        socket.join(roomid);
        callback(null, myRoom);
    }
}

// iceCandidate를 받으면 반대쪽 endpoint에 추가
// 인자를 candidate 하나만 받는 mediaPipeline의 addIceCandidate (kurento 내장함수) 와 다른 함수
function addIceCandidate(socket, senderid, roomid, iceCandidate, callback) {
    let user = io.sockets.adapter.rooms[roomid].participants[socket.id];
    if (user != null) {
        let candidate = kurento.register.complexTypes.IceCandidate(iceCandidate);
        if (senderid === user.id) {
            if (user.outgoingMedia) {
                user.outgoingMedia.addIceCandidate(candidate);
            } else {
                iceCandidateQueues[user.id].push({candidate: candidate});
            }
        } else {
            if (user.incomingMedia[senderid]) {
                user.incomingMedia[senderid].addIceCandidate(candidate);
            } else {
                if (!iceCandidateQueues[senderid]) {
                    iceCandidateQueues[senderid] = [];
                }
                iceCandidateQueues[senderid].push({candidate: candidate});
            }
        }
        callback(null);
    } else {
        callback(new Error("addIceCandidate failed")); // user 존재하지 않으면 icecandidate 추가 불가
    }
}

function receiveVideo(socket, userid, roomid, sdpOffer, callback) {
    getUserEndpoint(socket, userid, roomid, (err, endpoint) => {
        if (err) {
            return callback(err);
        }

        endpoint.processOffer(sdpOffer, (err, sdpAnswer) => { // processOffer(offer, callback)
            if (err) {
                return callback(err);
            }

            socket.emit('message', {
                event: 'receiveAnswer',
                calleeid: userid,
                sdpAnswer: sdpAnswer
            });

            // gatherCandidates(callback) : ice 후보자 수집, endpoint를 get 한 이후에 호출되어야 함
            endpoint.gatherCandidates (err => {
                if (err) {
                    return callback(err);
                }
            });
        });
    });
}

function getUserEndpoint(socket, calleeid, roomid, callback) {
    let myRoom = io.sockets.adapter.rooms[roomid];
    
    const caller = myRoom.participants[socket.id];
    const callee = myRoom.participants[calleeid];
    
    // caller와 callee가 같으면 본인의 video를 return해줌
    if (caller.id === callee.id) {
        return callback(null, caller.outgoingMedia);
    }

    // 이미 해당 user의 video를 받았는지 중복 체크, 중복이면 caller의 incoming과 callee의 outgoing 연결
    if (caller.incomingMedia[callee.id]) {
        callee.outgoingMedia.connect(caller.incomingMedia[callee.id], err => {
            if (err) {
                return callback(err);
            }
            callback(null, caller.incomingMedia[callee.id]);
        });
    } else {
        // 없으면 endpoint 생성
        myRoom.pipeline.create('WebRtcEndpoint', (err, incomingMedia) => {
            if (err) {
                return callback(err);
            }

            caller.incomingMedia[callee.id] = incomingMedia;

            // iceCandidate가 존재할 경우 add
            let iceCandidateQueue = iceCandidateQueues[user.id];
            if (iceCandidateQueue) {
                while (iceCandidateQueue.length) {
                    let ice = iceCandidateQueue.shift();
                    console.error(`user: ${caller.name} collect candidate for outgoing media`);
                    incomingMedia.addIceCandidate(ice.candidate);
                }
            }

            // endpoint의 onIceCandidate event를 설정
            incomingMedia.on('OnIceCandidate', event => {
                let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
                socket.emit('message', {
                    event: 'candidate',
                    userid: callee.id,
                    candidate: candidate
                });
            });

            callee.outgoingMedia.connect(incomingMedia, err => {
                if (err) {
                    return callback(err);
                }
                callback(null, incomingMedia);
            });
        });
    }
}