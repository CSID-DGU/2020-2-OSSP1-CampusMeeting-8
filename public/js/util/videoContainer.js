const html =
    `<div class="camera-over" data-over="false">
<button class="over-button" id='warn'>경고</button>
<button class="over-button">강퇴</button>
<button class="over-button">채팅금지</button>
</div>
<video class="camera-video" autoplay></video>`;

function makeVideoContainer() {

    const container = document.createElement('div');
    container.classList.add('camera-container');
    container.innerHTML = html;
    const over = container.querySelector('.camera-over');
    const video = container.querySelector('.camera-video');
    const warn = container.querySelector('#warn');

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
    })

    container.addEventListener('click', (e) => {

        if (e.target.classList.contains('over-button'))
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

    warn.addEventListener('click', (e) => {
    })

    return container;
}
export default makeVideoContainer;