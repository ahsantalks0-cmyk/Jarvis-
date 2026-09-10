/**
 * Jarvis Desktop Application - Main Process
 * Phase 1: Foundation & UI Skeleton
 */

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import electronUpdater from 'electron-updater';
import agentRegistry from './agent-registry.js';

const { autoUpdater } = electronUpdater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

// Configure Auto-Updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function sendToWindow(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
    if (channel !== 'update-status') {
      mainWindow.webContents.send('update-status', data);
    }
  }
}

// Auto-updater event wiring
autoUpdater.on('checking-for-update', () => {
  sendToWindow('updater:status', {
    status: 'checking',
    message: 'Connecting to GitHub repository releases...',
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('update-available', (info) => {
  sendToWindow('updater:status', {
    status: 'available',
    version: info.version,
    releaseDate: info.releaseDate,
    message: `New update available: v${info.version}`,
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('update-not-available', (info) => {
  sendToWindow('updater:status', {
    status: 'up-to-date',
    version: app.getVersion(),
    message: `Jarvis is up to date (v${app.getVersion()}).`,
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  sendToWindow('updater:status', {
    status: 'downloading',
    percent: Math.round(progressObj.percent || 0),
    transferred: progressObj.transferred,
    total: progressObj.total,
    message: `Downloading update package (${Math.round(progressObj.percent || 0)}%)...`,
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('update-downloaded', (info) => {
  sendToWindow('updater:status', {
    status: 'downloaded',
    version: info.version,
    message: `v${info.version} downloaded. Will install on restart.`,
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('error', (err) => {
  console.error('Auto-updater error:', err);
  sendToWindow('updater:status', {
    status: 'error',
    message: err?.message || 'Could not verify updates with GitHub releases.',
    timestamp: new Date().toISOString()
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0a0a0f',
    title: 'Jarvis',
    show: false,
    frame: true, // Keep standard title bar for now as specified
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // F12 keyboard shortcut to toggle DevTools open/close for debugging
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Add load failure logging
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('LOAD FAILED:', errorCode, errorDescription);
  });

  // Determine target URL: Check if Vite dev server is running on localhost:3000
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // In production or packaged app, load the built HTML file matching project structure
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html')).catch(() => {
      mainWindow.loadFile(path.join(__dirname, 'index.html'));
    });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Check for updates shortly after launch
  mainWindow.webContents.on('did-finish-load', () => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify().catch((err) => {
        console.warn('Initial update check error:', err?.message);
      });
    }
  });
}

// IPC Handlers
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('updater:check-updates', async () => {
  if (!app.isPackaged) {
    return {
      status: 'up-to-date',
      simulated: true,
      version: app.getVersion(),
      message: `Running in development mode. Version ${app.getVersion()} is active.`
    };
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      status: 'checking',
      updateInfo: result?.updateInfo
    };
  } catch (error) {
    return {
      status: 'error',
      message: error?.message || 'Failed to check GitHub releases'
    };
  }
});

ipcMain.handle('check-for-updates', async () => {
  if (!app.isPackaged) {
    return {
      status: 'up-to-date',
      simulated: true,
      version: app.getVersion(),
      message: `Running in development mode. Version ${app.getVersion()} is active.`
    };
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      status: 'checking',
      updateInfo: result?.updateInfo
    };
  } catch (error) {
    return {
      status: 'error',
      message: error?.message || 'Failed to check GitHub releases'
    };
  }
});

ipcMain.handle('updater:install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('agent-registry:get-all', () => {
  return agentRegistry.getAgents();
});

ipcMain.handle('agent-registry:toggle', (_event, id) => {
  return agentRegistry.toggleAgent(id);
});

ipcMain.on('window:control', (_event, action) => {
  if (!mainWindow) return;
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
  }
});

ipcMain.handle('shell:open-external', (_event, url) => {
  return shell.openExternal(url);
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
