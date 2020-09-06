const video = document.querySelector('video');
const startbtn = document.getElementById('startBtn');
const stopbtn = document.getElementById('stopBtn');
const videoselectionbtn = document.getElementById('videoSelectBtn');
let mediaRecorder;
const recorderdChunks = [];
videoselectionbtn.onclick = getVideoSources;
const { desktopCapturer, remote } = require('electron');

const { dialog, Menu } = remote;
const { writeFile } = require('fs');

function mediastop(){
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
}


startbtn.onclick = e =>{
  if(e.srcElement.innerText==='Recording'){
    mediastop();
  }
  else if(!video.srcObject){
    dialog.showErrorBox('Source','Select the source first');
  }
  else{
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
  }
}


stopbtn.onclick = e => {
  if (typeof mediaRecorder !== 'undefined') {
    if(mediaRecorder.state!=='inactive'){
      mediastop();
    }
  }
  else{
    dialog.showErrorBox('Recording','Start the recording first');
  }
};

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
      types: ['window', 'screen']
    });
    const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.filter(inputSources=>inputSources.name!=='Electron Screen Recorder').map(source => {
        return {
          label: source.name,
          click: () => selectSource(source)
        };
      })
    );
  
  
    videoOptionsMenu.popup();
  }
  
  async function selectSource(source){
    videoselectionbtn.innerText;
    const constraints ={
      audio:false,
      video:{
        mandatory:{
          chromeMediaSource:'desktop',
          chromeMediaSourceId:source.id,
        }

      }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject=stream;
    video.play();

    const options = {mimeType:'video/webm;codecs=vp9'};
    mediaRecorder = new MediaRecorder(stream,options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
  }

  function handleDataAvailable(e){
    console.log('video is now available');
    recorderdChunks.push(e.data);
  }

  async function handleStop(e){
    const blob = new Blob(recorderdChunks,{
      type: 'video/webm; codecs=vp9'
    });
    
    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save video',
      defaultPath: `vid-${Date.now()}.webm`
    });
  
    if (filePath) {
      writeFile(filePath, buffer, () => console.log('video saved successfully!'));
    }
  }