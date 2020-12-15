function addRed(ele){
    ele.classList.add('active-red');
}
function removeRed(ele){
    ele.classList.remove('active-red');
}


const recordStart=document.getElementById('record-start');
const recordPause=document.getElementById('record-pause');
const recordStop=document.getElementById('record-stop');
const recordTest=document.getElementById('record-test');
const recordDownload=document.getElementById('record-download');

const recordState={
    start:"start",
    recording:"recording",
    pause:"pause",
    end:"end"
}

let nowRecordState=recordState.start;
let recordList=[],recorder;

const  recordOption= {
    tag: 'video',
    type: 'video/webm',
    ext: '.mp4',
    gUM: {video: true, audio: true}
}



recordStart.addEventListener('click',()=>{
    if(nowRecordState==recordState.start||nowRecordState==recordState.end){
        nowRecordState=recordState.recording;
        let recordStream = participants[socket.id].rtcPeer.getLocalStream();//학생 교수 구분 필요
        recorder=new MediaRecorder(recordStream);
        recorder.ondataavailable=e=>{
            recordList=[]
            recordList.push(e.data);
            if(recorder.state=='inactive') {
                nowRecordState=recordState.end;
                makeLink();
                removeRed(recordPause);
                removeRed(recordStart);
            }
        }
        recorder.start();
    }
    else if(nowRecordState==recordState.pause){
        nowRecordState=recordState.recording;
        recorder.resume();
    }
    addRed(recordStart);
    removeRed(recordPause);
})

recordPause.addEventListener('click',()=>{
    if(nowRecordState==recordState.recording){
        console.log('record pause');
        nowRecordState=recordState.pause;
        recorder.pause();

        addRed(recordPause);
        removeRed(recordStart);
    }
})
recordStop.addEventListener('click',()=>{
    if(nowRecordState==recordState.pause||nowRecordState==recordState.recording){
        console.log('record end');
        nowRecordState=recordState.end;
        recorder.stop();
        removeRed(recordPause);
        removeRed(recordStart);
    }
})
function makeLink(){
    let blob = new Blob(recordList, {type: recordOption.type });
    let url = URL.createObjectURL(blob);
    recordTest.controls=true;
    recordTest.src=url;
    recordDownload.href=url;
    recordDownload.download="record-test."+recordOption.ext;
  }
