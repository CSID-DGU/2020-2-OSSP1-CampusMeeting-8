var board, ctx, isDrawing = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0

let mode = 'line';
let figureX = 0, figureY = 0, figureW = 0, figureH = 0;//도형 그리기 시작점

const boardContainer = document.getElementById("board-container");
const penBtn = document.getElementById("pen");
const eraserBtn = document.getElementById("eraser");
const rectBtn = document.getElementById("rect");
const circleBtn = document.getElementById("circle");

const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const clearBtn = document.getElementById("clear");
const exitBtn = document.getElementById("exit");



var lineColor = "black";

function init() {
  board = document.getElementById('board');
  ctx = board.getContext("2d");

  board.addEventListener("mousemove", function (e) {
    eventHandler('move', e)
  }, false);
  board.addEventListener("mousedown", function (e) {
    eventHandler('down', e)
  }, false);
  board.addEventListener("mouseup", function (e) {
    eventHandler('up', e)
  }, false);
  board.addEventListener("mouseout", function (e) {
    eventHandler('out', e)
  }, false);
}

init();

function drawLine() {
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.stroke();
  ctx.closePath();
}
function drawRect() {
  redraw();
  ctx.beginPath();
  ctx.rect(figureX, figureY, currX - figureX, currY - figureY);
  ctx.stroke();
}
function drawCircle() {
  redraw();
  ctx.beginPath();
  ctx.ellipse((figureX + currX) / 2, (figureY + currY) / 2, Math.abs(currX - figureX) / 2, Math.abs(currY - figureY) / 2, 0, 0, 2 * Math.PI);
  ctx.stroke();
}

//////////////////////////////

// 마우스 클릭 오류시 resize 해야함
window.addEventListener('resize', redraw);

  setTimeout(
  () => {
    board.width = board.parentElement.offsetWidth;
    board.height = board.parentElement.offsetHeight;
    capture();

  }, 100);

function redraw() {
  board.width = board.parentElement.offsetWidth;
  board.height = board.parentElement.offsetHeight;
  let screen = new Image();
  screen.src = screenArray[Index];
  screen.onload = () => {
    ctx.drawImage(screen, 0, 0);
  }
}
let screenArray = [];
let Index = -1;

function capture() {
  Index++;
  screenArray.splice(Index);
  screenArray.push(board.toDataURL());
}


function updatexy(e) {
  prevX = currX;
  prevY = currY;
  currX = e.clientX - board.offsetLeft;
  currY = e.clientY - board.offsetTop;
}


function eventHandler(res, e) {
  switch (res) {
    case 'down':
      updatexy(e)
      isDrawing = true;
      if (mode == 'rect' || mode == 'circle') {//시작점 저장
        figureX = currX;
        figureY = currY;
      }
      break;
    case 'up':
    case 'out':
      if (isDrawing)
        capture();
      isDrawing = false;
      break;
    case 'move':
      if (isDrawing) {
        updatexy(e);
        if (mode == 'line'){
          ctx.lineWidth=2;

          drawLine();
        }else if(mode=='erase'){
          ctx.lineWidth=6;
          drawLine();
        }
        else if (mode == 'rect') {
          drawRect();
        }
        else if (mode == 'circle') {
          drawCircle();
        }
      }
      break;
  }
}



/////button click event
eraserBtn.addEventListener('click', () => {
  mode = 'erase';
  ctx.strokeStyle="white"
})

undoBtn.addEventListener('click', () => {
  if (Index > 0) {
    Index--;
    redraw();
  }
})

redoBtn.addEventListener('click', () => {
  if (Index < screenArray.length - 1) {
    Index++;
    setTimeout(
      redraw(), 10);
  }
})

penBtn.addEventListener('click', (e) => {
  mode = 'line';
  ctx.strokeStyle = "black";
})

rectBtn.addEventListener('click', () => {
  mode = 'rect';
})

circleBtn.addEventListener('click', () => {
  mode = 'circle';
})

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, board.width, board.height);
  capture();
})

exitBtn.addEventListener('click',()=>{
  boardContainer.style="display:none";
})

const boardBtn=document.getElementById('boardBtn');
boardBtn.addEventListener('click',()=>{
  boardContainer.style="display:flex";
  redraw();
})