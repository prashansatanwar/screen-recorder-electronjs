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
  
document.getElementById('videoSourceDropdown').onchange = async (event) => {
	const sourceId = event.target.value;
	const inputSources = await window.electron.getVideoSources();
	const selectedSource = inputSources.find(src => src.id === sourceId);

	if (selectedSource) {
		// console.log('Selected source:', selectedSource);
	}
};
  