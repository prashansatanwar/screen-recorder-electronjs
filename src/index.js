const { app, BrowserWindow, ipcMain, desktopCapturer, dialog } = require('electron');
const path = require('path');
const { writeFile } = require('fs');

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
      return inputSources;
    } catch (error) {
      console.error('Error getting video sources:', error);
      return [];
    }
  });
}

// Handle video saving

ipcMain.on('save-video', async (event, buffer) => {
  console.log("Received video data in main process.");
  
  const { filePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save Video',
      defaultPath: `vid-${Date.now()}.webm`
  });

  if (filePath) {
      writeFile(filePath, buffer, (err) => {
          if (err) {
              console.error("Error saving video:", err);
          } else {
              console.log("Video saved successfully!");
          }
      });
  } else {
      console.warn("No file path selected.");
  }
});
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
