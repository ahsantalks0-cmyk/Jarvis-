/**
 * Jarvis Preload Script
 * Secure IPC bridge adhering to Electron security best practices:
 * - contextIsolation: true
 * - nodeIntegration: false
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // App & Platform Metadata
  isElectron: true,
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke('app:get-version'),

  // Auto-Updater Controls & Listeners
  checkForUpdates: () => ipcRenderer.invoke('updater:check-updates'),
  downloadUpdate: () => ipcRenderer.invoke('updater:download-update'),
  installUpdate: () => ipcRenderer.invoke('updater:install-update'),
  onUpdateStatus: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('updater:status', subscription);
    ipcRenderer.on('update-status', subscription);
    return () => {
      ipcRenderer.removeListener('updater:status', subscription);
      ipcRenderer.removeListener('update-status', subscription);
    };
  },

  // Agent Registry Operations
  getAgents: () => ipcRenderer.invoke('agent-registry:get-all'),
  toggleAgent: (id) => ipcRenderer.invoke('agent-registry:toggle', id),

  // Window Controls
  windowControl: (action) => ipcRenderer.send('window:control', action),
  
  // External link opener
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),

  // Brain API Key SafeStorage Encryption
  isSafeStorageAvailable: () => ipcRenderer.invoke('safe-storage:is-available'),
  safeStorageEncrypt: (plainText) => ipcRenderer.invoke('safe-storage:encrypt', plainText),
  safeStorageDecrypt: (cipherText) => ipcRenderer.invoke('safe-storage:decrypt', cipherText)
});
