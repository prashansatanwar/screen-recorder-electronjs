const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Ensure preload is set
      nodeIntegration: false, // Disable nodeIntegration for security reasons
      contextIsolation: true, // Ensure contextIsolation is true
    },
  });

  
  mainWindow.loadFile(path.join(__dirname, 'index.html')); // Ensure this URL points to your correct app

  // Log desktopCapturer sources to check if we get anything
  ipcMain.handle('get-video-sources', async () => {
    try {
      const inputSources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
      });
      console.log('Available sources:', inputSources);
      return inputSources;
    } catch (error) {
      console.error('Error getting video sources:', error);
      return [];
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
