// const videoSelectBtn = document.getElementById('videoSelectBtn')
const dropdown = document.getElementById('videoSourceDropdown');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

const recordButtons = document.getElementById('recordButtons');

let mediaRecorder;
let selectedSource = null;
const recordedChunks = [];

const optionClass = ""

dropdown.onmousedown = async (e) => {
    try {
      const inputSources = await window.electron.getVideoSources();

      dropdown.innerHTML = ''
      if(selectedSource) {
        const placeholderOption = document.createElement('option');
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.hidden = true;
        placeholderOption.textContent = selectedSource.name;
        dropdown.appendChild(placeholderOption);
      }
      if (inputSources && inputSources.length > 0) {
        inputSources.forEach((source) => {
          const option = document.createElement('option');
          option.value = source.id;
          option.innerText = source.name;
          dropdown.appendChild(option);
        });
      } 
    } catch (error) {
      console.error('Error fetching video sources:', error);
    }
};

  
dropdown.onchange = async (event) => {
	const sourceId = event.target.value;
	const inputSources = await window.electron.getVideoSources();
	selectedSource = inputSources.find(src => src.id === sourceId);
	
	if (selectedSource) {
    recordButtons.classList.remove("hidden");
    dropdown.innerHTML = '';
    const placeholderOption = document.createElement('option');
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.hidden = true;
    placeholderOption.textContent = selectedSource.name;
    dropdown.appendChild(placeholderOption);

		const constraints = {
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: sourceId
				}
			}
		}

		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		const videoElement = document.querySelector('video');
		videoElement.srcObject = stream;
		videoElement.play();

		const options = {mimeType: 'video/webm; codecs=vp9'};
		mediaRecorder = new MediaRecorder(stream, options);

		mediaRecorder.ondataavailable = handleDataAvailable;
		mediaRecorder.onstop = handleStop;
	}
};

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
      recordedChunks.push(event.data);
  }
};

const handleStop = async (e) => {
	console.log('stop video');
	const blob = new Blob(recordedChunks, {
		type: 'video/webm; codecs=vp9'
	});

	// Convert Blob to an ArrayBuffer and send it to the main process
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer); // Convert to Uint8Array

    console.log("Sending video data to main process...");
    window.electron.saveVideo(buffer); // Send to main process for saving
}
  
startBtn.onclick = e => {
	if (!mediaRecorder) {
        console.error("No video source selected! Please select a source first.");
        return;
    }
    
    if (mediaRecorder.state === "recording") {
        console.warn("Recording is already in progress.");
        return;
    }

    recordedChunks.length = 0; // Clear old data
	
	mediaRecorder.start();
  stopBtn.disabled = false;
	startBtn.innerText = 'Recording';
  startBtn.disabled = true;
};

stopBtn.onclick = e => {
	if (!mediaRecorder) {
        console.error("No recording in progress!");
        return;
    }
	mediaRecorder.stop();
  stopBtn.disabled = true;
	startBtn.innerText = 'Start';
  startBtn.disabled = false;
};