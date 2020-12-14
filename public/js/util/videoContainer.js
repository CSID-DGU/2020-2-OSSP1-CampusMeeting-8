const overMode = {
    default: "default",
    control: "over-control",
    question: "over-question",
    leave: "over-leave",
    wait: "over-wait"
}

function makeVideoContainer(userid, username) {

    const template =
        `
    <div class="over-control camera-over under">
        <div class='over-userName'>${username}</div>
        <div class='over-button-box'>
            <button class="warn-button">경고</button>
            <button class="kick-button">강퇴</button>
            <button class="over-button">채팅금지</button>
        </div>
    </div>

    <div class="over-question camera-over under">
        <div class='over-userName'>${username}</div>
        <div >질문 요청</div>
        <div class='over-button-box'>
            <button class="question-refuse">거절</button>
            <button class="question-accept">수락</button>
        </div>
    </div>

    <div class="over-leave camera-over under">
        <div class='over-userName'>${username}</div>
        <div >자리비움 요청</div>
        <div class='over-button-box'>
            <button class="leave-refuse">거절</button>
            <button class="leave-accept">수락</button>
        </div>
    </div>

    <div class="over-wait camera-over under">
        <div class='over-userName'>${userid}</div>
        <div class='time-box'></div>
    </div>
    <video id=${userid} class="camera-video" autoplay></video>`;

    const container = document.createElement('div');
    container.classList.add('camera-container');
    container.innerHTML = template;
    const warn = container.querySelector('.warn-button');
    const kick = container.querySelector('.kick-button');
    const questionRef = container.querySelector('.question-refuse');
    const questionAcc = container.querySelector('.question-accept');
    const leaveRef = container.querySelector('.leave-refuse');
    const leaveAcc = container.querySelector('.leave-accept');

    let user = participants[userid];
    console.log(participants, userid);
    user.VCstate = {
        container: container,
        nowOverMode: overMode.default,
        isWaiting: false,
        timefunction: null
    };
    container.addEventListener('click', (e) => {
        // if(e.target)
        console.log(e.target.tagName);
        if (e.target.tagName == 'BUTTON') {
            return;
        }
        const id = container.getElementsByTagName('video')[0].id;
        const state = getVCstate(id);
        let nowOverMode = state.nowOverMode;
        if (nowOverMode == overMode.default || nowOverMode == overMode.wait) {
            changeOverMode(id, overMode.control);
        } else if (nowOverMode == overMode.control && state.isWaiting) {
            changeOverMode(id, overMode.wait);
        }
        else {
            changeOverMode(id, overMode.default);
        }
    })

    warn.addEventListener('click', (e) => {
        socket.emit('message', {
            event: 'warn',
            warnMessage: 'warning',
            userid: userid
        })
    })

    kick.addEventListener('click', () => {
        socket.emit('message', {
            event: 'kick',
            userid: userid
        })
    })

    questionRef.addEventListener('click', () => {
        socket.emit('message', {
            event: 'question-refuse',
            userid: userid
        })
    })
    questionAcc.addEventListener('click', () => {
        socket.emit('message', {
            event: 'question-accept',
            userid: userid
        })
    })
    leaveRef.addEventListener('click', () => {
        socket.emit('message', {
            event: 'leave-refuse',
            userid: userid
        })
    })
    leaveAcc.addEventListener('click', () => {
        socket.emit('message', {
            event: 'leave-accept',
            userid: userid
        })
        startWaiting(userid);
    })
    return container;
}

function startWaiting(userid) {
    let state = getVCstate(userid);
    state.isWaiting = true;
    changeOverMode(userid, overMode.wait);

    const timeBox = state.container.getElementsByClassName('time-box')[0];
    let time = 600, min, sec;
    state.timefunction = setInterval(() => {
        min = parseInt(time / 60);
        sec = time % 60;
        if (min < 10) {
            min = '0' + min;
        }
        timeBox.innerHTML = min + ':' + sec;
        time--;
        if (time < 0) {
            clearInterval(state.timefunction);
            state.isWaiting = false;
            changeOverMode(userid, overMode.default);
        }
    }, 1000)

};

function recieveLeaveReturn(studentid) {
    const state = getVCstate(studentid);
    clearInterval(state.timefunction);
    state.isWaiting = false;
    changeOverMode(studentid, overMode.default);
}


function changeOverMode(id, mode) {
    let state = getVCstate(id);
    state.nowOverMode = mode;
    const nowOver = state.container.querySelector('.over')
    if (nowOver) {
        nowOver.classList.replace('over', 'under');
    }
    if (mode == overMode.default) {
        return;
    }
    let newOver = state.container.getElementsByClassName(mode);
    newOver[0].classList.replace('under', 'over');
}

function getVCstate(id) {
    return participants[id].VCstate;
}