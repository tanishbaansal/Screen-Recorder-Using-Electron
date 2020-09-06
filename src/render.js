const video = document.querySelector('video');
const startbtn = document.querySelector('#startBtn');
const stopbtn = document.querySelector('#stopBtn');
const videoselectionbtn = document.querySelector('#videoSelectBtn');
let mediaRecorder;
const recorderdChunks = [];
videoselectionbtn.onclick = getVideoSources;
const { desktopCapturer, remote } = require('electron');

const { dialog, Menu } = remote;
const { writeFile } = require('fs');

startbtn.onclick = e =>{
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
}

stopbtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
      types: ['window', 'screen']
    });
  
    const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.map(source => {
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