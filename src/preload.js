console.log('Preload script loaded!'); // This should appear in the DevTools console
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getVideoSources: () => ipcRenderer.invoke('get-video-sources'),
  saveVideo: (buffer) => ipcRenderer.send('save-video', buffer)
});
