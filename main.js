/**
 * Jarvis Desktop Application - Main Process
 * Phase 1: Foundation & UI Skeleton
 */

import { app, BrowserWindow, ipcMain, shell, safeStorage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import electronUpdater from 'electron-updater';
import agentRegistry from './agent-registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

// Configure Auto-Updater
const autoUpdater = electronUpdater.autoUpdater || electronUpdater;
autoUpdater.logger = console;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowPrerelease = false;

// Explicit GitHub feed configuration fallback
try {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'ahsantalks0-cmyk',
    repo: 'Jarvis-'
  });
  console.log('[AutoUpdater] Configured GitHub feed: ahsantalks0-cmyk/Jarvis-');
} catch (feedErr) {
  console.warn('[AutoUpdater] setFeedURL warning:', feedErr?.message || feedErr);
}

function sendToWindow(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
    if (channel !== 'update-status') {
      mainWindow.webContents.send('update-status', data);
    }
  }
}

// Auto-updater event wiring with comprehensive logging
autoUpdater.on('checking-for-update', () => {
  console.log('[AutoUpdater] [CHECKING] Contacting GitHub releases repository (ahsantalks0-cmyk/Jarvis-)...');
  sendToWindow('updater:status', {
    status: 'checking',
    message: 'Checking for updates on GitHub...',
    lastChecked: new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('update-available', (info) => {
  console.log(`[AutoUpdater] [AVAILABLE] Update v${info?.version} found! (current: v${app.getVersion()})`);
  sendToWindow('updater:status', {
    status: 'available',
    version: info?.version,
    releaseDate: info?.releaseDate,
    releaseNotes: info?.releaseNotes,
    message: `Update v${info?.version} available — downloading...`,
    lastChecked: new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('update-not-available', (info) => {
  const currentVersion = app.getVersion();
  console.log(`[AutoUpdater] [NOT-AVAILABLE] Current version (v${currentVersion}) is up to date.`);
  sendToWindow('updater:status', {
    status: 'up-to-date',
    version: currentVersion,
    message: `Jarvis is up to date (v${currentVersion})`,
    lastChecked: new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj?.percent || 0);
  const remainingPercent = Math.max(0, 100 - percent);
  const transferred = progressObj?.transferred || 0;
  const total = progressObj?.total || 0;
  const speed = Math.round((progressObj?.bytesPerSecond || 0) / 1024);
  console.log(`[AutoUpdater] [PROGRESS] ${percent}% (${transferred}/${total} bytes @ ${speed} KB/s, remaining: ${remainingPercent}%)`);
  sendToWindow('updater:status', {
    status: 'downloading',
    percent: percent,
    remainingPercent: remainingPercent,
    transferred: transferred,
    total: total,
    bytesPerSecond: progressObj?.bytesPerSecond || 0,
    message: `Downloading update package (${percent}% downloaded, ${remainingPercent}% remaining)...`,
    lastChecked: new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('update-downloaded', (info) => {
  console.log(`[AutoUpdater] [DOWNLOADED] Update v${info?.version} downloaded successfully and staged.`);
  sendToWindow('updater:status', {
    status: 'downloaded',
    version: info?.version,
    message: `Update v${info?.version} downloaded. Restart to update.`,
    lastChecked: new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString()
  });
});

autoUpdater.on('error', (err) => {
  const errorMsg = err?.message || String(err);
  console.error('[AutoUpdater] [ERROR] Auto-updater error:', err);
  sendToWindow('updater:status', {
    status: 'error',
    message: `Update check failed: ${errorMsg}`,
    error: err?.stack || errorMsg,
    lastChecked: new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString()
  });
});

// Periodic check every 30 minutes while app is running
const PERIODIC_CHECK_MS = 30 * 60 * 1000;
setInterval(() => {
  if (app.isPackaged) {
    console.log('[AutoUpdater] Running scheduled 30-minute autoUpdater.checkForUpdatesAndNotify()...');
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error('[AutoUpdater] Periodic update check failed:', err?.message || err);
    });
  } else {
    console.log('[AutoUpdater] Periodic check skipped (development mode).');
  }
}, PERIODIC_CHECK_MS);

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

  // Check for updates: 5 seconds after window finishes loading, ONLY when packaged
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[AutoUpdater] Window finished loading. Scheduling 5-second startup check for updates...');
    setTimeout(() => {
      if (app.isPackaged) {
        console.log('[AutoUpdater] App is packaged. Initiating automatic startup check...');
        autoUpdater.checkForUpdatesAndNotify().catch((err) => {
          const errorMsg = err?.message || String(err);
          console.error('[AutoUpdater] Startup update check failed:', errorMsg);
          sendToWindow('updater:status', {
            status: 'error',
            message: `Update check failed: ${errorMsg}`,
            lastChecked: new Date().toLocaleTimeString(),
            timestamp: new Date().toISOString()
          });
        });
      } else {
        console.log('[AutoUpdater] Dev mode detected (app.isPackaged is false). Skipping auto-update check.');
      }
    }, 5000);
  });
}

// IPC Handlers
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

const handleCheckUpdates = async () => {
  console.log('[AutoUpdater] Manual check requested by renderer. isPackaged:', app.isPackaged);
  if (!app.isPackaged) {
    const devState = {
      status: 'up-to-date',
      simulated: true,
      version: app.getVersion(),
      message: `Jarvis is up to date (v${app.getVersion()}) [Dev mode]`,
      lastChecked: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString()
    };
    sendToWindow('updater:status', devState);
    return devState;
  }

  sendToWindow('updater:status', {
    status: 'checking',
    version: app.getVersion(),
    message: 'Checking for updates on GitHub...',
    lastChecked: new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString()
  });

  try {
    const result = await autoUpdater.checkForUpdates();
    console.log('[AutoUpdater] Manual check completed. Found version:', result?.updateInfo?.version);
    return {
      status: 'checking',
      updateInfo: result?.updateInfo,
      lastChecked: new Date().toLocaleTimeString()
    };
  } catch (error) {
    const errorMsg = error?.message || String(error);
    console.error('[AutoUpdater] Manual check error:', errorMsg);
    const errorState = {
      status: 'error',
      version: app.getVersion(),
      message: `Update check failed: ${errorMsg}`,
      lastChecked: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString()
    };
    sendToWindow('updater:status', errorState);
    return errorState;
  }
};

ipcMain.handle('updater:check-updates', handleCheckUpdates);
ipcMain.handle('check-for-updates', handleCheckUpdates);

ipcMain.handle('updater:download-update', async () => {
  console.log('[AutoUpdater] Manual download requested by renderer...');
  try {
    return await autoUpdater.downloadUpdate();
  } catch (err) {
    const errorMsg = err?.message || String(err);
    console.error('[AutoUpdater] Download error:', errorMsg);
    throw err;
  }
});

ipcMain.handle('updater:install-update', () => {
  console.log('[AutoUpdater] Executing quitAndInstall()...');
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('install-update', () => {
  console.log('[AutoUpdater] Executing quitAndInstall() via install-update...');
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

// SafeStorage encryption for Brain API keys
ipcMain.handle('safe-storage:is-available', () => {
  return safeStorage && safeStorage.isEncryptionAvailable ? safeStorage.isEncryptionAvailable() : false;
});

ipcMain.handle('safe-storage:encrypt', (_event, plainText) => {
  try {
    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      const buffer = safeStorage.encryptString(plainText);
      return { success: true, cipherText: buffer.toString('base64') };
    }
    return { success: false, error: 'SafeStorage encryption unavailable' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('safe-storage:decrypt', (_event, cipherText) => {
  try {
    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      const buffer = Buffer.from(cipherText, 'base64');
      const plainText = safeStorage.decryptString(buffer);
      return { success: true, plainText };
    }
    return { success: false, error: 'SafeStorage encryption unavailable' };
  } catch (err) {
    return { success: false, error: err.message };
  }
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
