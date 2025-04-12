const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // 브라우저 창 생성
  mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'build/icon.png')
  });

  // 개발 모드에서는 개발자 도구 열기
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // HTML 파일 로드
  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  // 창이 닫힐 때 이벤트
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron이 준비되면 창 생성
app.whenReady().then(createWindow);

// 모든 창이 닫히면 앱 종료 (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS에서는 dock 아이콘 클릭 시 창이 없으면 다시 생성
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});