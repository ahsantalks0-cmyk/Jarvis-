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
  onUpdateStatus: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('updater:status', subscription);
    return () => ipcRenderer.removeListener('updater:status', subscription);
  },

  // Agent Registry Operations
  getAgents: () => ipcRenderer.invoke('agent-registry:get-all'),
  toggleAgent: (id) => ipcRenderer.invoke('agent-registry:toggle', id),

  // Window Controls
  windowControl: (action) => ipcRenderer.send('window:control', action),
  
  // External link opener
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url)
});
