const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const input = document.getElementById('input');
const joinBtn = document.getElementById('join');
const roomIDInput = document.getElementById('roomID');
const speakerBtn = document.getElementById('speaker');

createRoomBtn.addEventListener('click', () => {
    location.href = "/room/create";
});

speakerBtn.addEventListener('click', () => {
    const roomID = roomIDInput.value;
    if (roomID) {
        location.href = `/room/${roomID}/mobile`;
    }
})

joinBtn.addEventListener('click', () => {
    joinRoom();
});

function joinRoom() {
    const roomID = roomIDInput.value;
    if (roomID) {
        location.href = `/room/${roomID}`;
    }
}