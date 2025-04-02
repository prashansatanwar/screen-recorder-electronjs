const videoSelectBtn = document.getElementById('videoSelectBtn')

videoSelectBtn.onclick = async () => {
    try {
      const inputSources = await window.electron.getVideoSources();
      // console.log('Input sources:', inputSources);
  
      const dropdown = document.getElementById('videoSourceDropdown');
      dropdown.innerHTML = ''; // Clear previous entries
  
      if (inputSources && inputSources.length > 0) {
        inputSources.forEach((source) => {
          const option = document.createElement('option');
          option.value = source.id;
          option.innerText = source.name;
          dropdown.appendChild(option);
        });
        dropdown.style.display = 'block'; // Show dropdown if hidden
      } else {
        // console.log('No video sources available.');
        dropdown.style.display = 'none'; // Hide dropdown if no sources
      }
    } catch (error) {
      console.error('Error fetching video sources:', error);
    }
};

let mediaRecorder;
const recordedChunks = [];
  
document.getElementById('videoSourceDropdown').onchange = async (event) => {
	const sourceId = event.target.value;
	const inputSources = await window.electron.getVideoSources();
	const selectedSource = inputSources.find(src => src.id === sourceId);

	
	if (selectedSource) {
		console.log('Selected source:', selectedSource);
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
	console.log(event);
    if (event.data.size > 0) {
		console.log('video data available');
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
  
const startBtn = document.getElementById('startBtn');
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
	startBtn.classList.add('is-danger');
	startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');

stopBtn.onclick = e => {
	if (!mediaRecorder) {
        console.error("No recording in progress!");
        return;
    }
	mediaRecorder.stop();
	startBtn.classList.remove('is-danger');
	startBtn.innerText = 'Start';
};