const html =
    `<div class="camera-over" data-over="false">
        <div class='over-userName'></div>
        <div class='over-button-box'>
            <button class="warn-button">경고</button>
            <button class="over-button">강퇴</button>
            <button class="over-button">채팅금지</button>
        </div>
    </div>
    <video class="camera-video" autoplay></video>`;

function makeVideoContainer(userid) {

    const container = document.createElement('div');
    container.classList.add('camera-container');
    container.innerHTML = html;
    const over = container.querySelector('.camera-over');
    const overUserName = container.querySelector('.over-userName');
    const video = container.querySelector('.camera-video');
    const warn = container.querySelector('.warn-button');

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
    })
    video.id = userid;
    overUserName.innerHTML = userid;

    container.addEventListener('click', (e) => {
        if (e.target.tagName == 'BUTTON')
            return;

        if (over.dataset['over'] == 'false') {
            over.dataset['over'] = true;
            over.style.zIndex = '1';
        }
        else {
            over.dataset['over'] = false;
            over.style.zIndex = '-1';
        }
    })




    return container;
}