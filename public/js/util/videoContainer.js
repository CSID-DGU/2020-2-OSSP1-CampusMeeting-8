const overMode = {
    default: "default",
    control: "over-control",
    question: "over-question",
    leave: "over-leave",
    wait: "over-wait"
}
let nowOverMode = overMode.default;

function makeVideoContainer(userid) {

    const template =
        `
    <div class="over-control camera-over under">
        <div class='over-userName'>${userid}</div>
        <div class='over-button-box'>
            <button class="warn-button">경고</button>
            <button class="kick-button">강퇴</button>
            <button class="over-button">채팅금지</button>
        </div>
    </div>

    <div class="over-question camera-over under">
        <div class='over-userName'>${userid}</div>
        <div >질문 요청</div>
        <div class='over-button-box'>
            <button class="">거절</button>
            <button class="">수락</button>
        </div>
    </div>

    <div class="over-leave camera-over under">
        <div class='over-userName'>${userid}</div>
        <div >자리비움 요청</div>
        <div class='over-button-box'>
            <button class="">거절</button>
            <button class="">수락</button>
        </div>
    </div>

    <div class="over-wait camera-over under">
        <div class='over-userName'>${userid}</div>
    </div>
    <video id=${userid} class="camera-video" autoplay></video>`;

    const container = document.createElement('div');
    container.classList.add('camera-container');
    container.innerHTML = template;
    const overControl = container.querySelector('#over-control');
    const warn = container.querySelector('.warn-button');
    const kick = container.querySelector('.kick-button');


    container.addEventListener('click', (e) => {
        if (nowOverMode == overMode.default) {
            changeOverMode(container, overMode.control);
        } else {
            changeOverMode(container, overMode.default);
        }
    })

    warn.addEventListener('click', (e) => {
        socket.emit('message', {
            event: 'warn',
            warnMessage: 'warning',
            userid: userid
        })
    })

    kick.addEventListener('click', (e) => {
        socket.emit('message', {
            event: 'kick',
            userid: userid
        })
    })
    return container;
}

function recieveQuestion(studentid) {
    const stVideo = document.getElementById(studentid);
    const container = stVideo.parentElement;
    changeOverMode(container, overMode.question);
}
function recieveLeave(studentid) {
    const stVideo = document.getElementById(studentid);
    const container = stVideo.parentElement;
    changeOverMode(container, overMode.leave);
}

function changeOverMode(container, mode) {
    nowOverMode = mode;
    const nowOver = container.querySelector('.over')
    if (nowOver) {
        nowOver.classList.replace('over', 'under');
    }
    if (mode == overMode.default) {
        return;
    }
    let newOver = container.getElementsByClassName(mode);
    newOver[0].classList.replace('under', 'over');
}