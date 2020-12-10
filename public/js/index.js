const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const input = document.getElementById('input');
const joinBtn = document.getElementById('join');
const roomIDInput = document.getElementById('roomID');

createRoomBtn.addEventListener('click', () => {
    location.href = "/room/create";
});

joinRoomBtn.addEventListener('click', () => {
    createRoomBtn.classList.add('invisible');
    joinRoomBtn.classList.add('invisible');
    input.classList.remove('invisible');
});

joinBtn.addEventListener('click', () => {
    joinRoom();
});

function joinRoom() {
    const roomID = roomIDInput.value;
    location.href = `/room/${roomID}`;
}