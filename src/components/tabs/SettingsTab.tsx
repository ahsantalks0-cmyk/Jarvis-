import { useState, useEffect } from 'react';
import {
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  Github,
  HardDrive,
  Cpu,
  Monitor,
  Sliders,
  Check,
  Shield,
  Layers
} from 'lucide-react';
import { UpdateState, UpdateStatus } from '../../types';
import { electronBridge } from '../../lib/electronBridge';

export default function SettingsTab() {
  const [updateState, setUpdateState] = useState<UpdateState>({
    status: 'idle',
    version: '1.0.0',
    message: 'Version 1.0.0 installed. Up-to-date with GitHub release channel.',
    lastChecked: 'Just now'
  });
  const [isChecking, setIsChecking] = useState(false);

  // General toggles
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [startMinimized, setStartMinimized] = useState(false);
  const [framelessMode, setFramelessMode] = useState(false);

  useEffect(() => {
    // Subscribe to IPC update status events if in Electron
    const unsubscribe = electronBridge.onUpdateStatus((state) => {
      setUpdateState(state);
      setIsChecking(state.status === 'checking');
    });
    return () => unsubscribe();
  }, []);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    setUpdateState({
      status: 'checking',
      version: '1.0.0',
      message: 'Connecting to GitHub repository releases (ahsantalks0-cmyk/jarvis)...',
      lastChecked: new Date().toLocaleTimeString()
    });

    try {
      const result = await electronBridge.checkForUpdates();
      setTimeout(() => {
        setUpdateState(result);
        setIsChecking(false);
      }, 1200);
    } catch (err: any) {
      setUpdateState({
        status: 'error',
        message: err?.message || 'Unable to fetch release metadata.',
        lastChecked: new Date().toLocaleTimeString()
      });
      setIsChecking(false);
    }
  };

  const simulateUpdateStatus = (status: UpdateStatus) => {
    switch (status) {
      case 'checking':
        setIsChecking(true);
        setUpdateState({
          status: 'checking',
          version: '1.0.0',
          message: 'Connecting to GitHub releases pipeline...',
          lastChecked: new Date().toLocaleTimeString()
        });
        break;
      case 'available':
        setIsChecking(false);
        setUpdateState({
          status: 'available',
          version: '1.0.1',
          message: 'New update available: v1.0.1 (Draft release found on GitHub)',
          lastChecked: new Date().toLocaleTimeString()
        });
        break;
      case 'downloading':
        setIsChecking(false);
        setUpdateState({
          status: 'downloading',
          version: '1.0.1',
          percent: 68,
          message: 'Downloading update binary package from GitHub (68%)...',
          lastChecked: new Date().toLocaleTimeString()
        });
        break;
      case 'up-to-date':
        setIsChecking(false);
        setUpdateState({
          status: 'up-to-date',
          version: '1.0.0',
          message: 'Jarvis is up to date (v1.0.0). No newer releases found.',
          lastChecked: new Date().toLocaleTimeString()
        });
        break;
      case 'error':
        setIsChecking(false);
        setUpdateState({
          status: 'error',
          version: '1.0.0',
          message: 'GitHub rate limit exceeded or connection timed out.',
          lastChecked: new Date().toLocaleTimeString()
        });
        break;
      default:
        setIsChecking(false);
        setUpdateState({
          status: 'idle',
          version: '1.0.0',
          message: 'Ready to check releases.',
          lastChecked: new Date().toLocaleTimeString()
        });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#06070a] space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0df597]" />
            <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
              System Settings & Updater
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#0e1624] text-[#0df597] border border-[#1b283d]">
              DESKTOP CONFIGURATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Auto-updater pipeline integration, package specifications, and desktop runtime toggles.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-400">
          <Github className="w-4 h-4 text-slate-300" />
          <span>ahsantalks0-cmyk/jarvis</span>
        </div>
      </div>

      {/* AUTO-UPDATER SECTION (Required requirement 2) */}
      <div className="p-5 rounded-2xl bg-[#0b0e16] border border-[#161c2b] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141825] pb-3.5">
          <div className="flex items-center gap-2.5">
            <RefreshCw className={`w-4 h-4 text-[#0df597] ${isChecking ? 'animate-spin' : ''}`} />
            <div>
              <h2 className="text-sm font-tech font-bold text-slate-200 uppercase tracking-wide">
                Auto-Updater Pipeline (electron-updater)
              </h2>
              <span className="text-[10px] font-mono-tech text-slate-500">
                GITHUB RELEASES CI/CD PIPELINE • DRAFT RELEASE CHANNEL
              </span>
            </div>
          </div>

          <button
            id="btn-check-updates"
            onClick={handleCheckForUpdates}
            disabled={isChecking}
            className="px-4 py-2 rounded-xl bg-[#0df597] text-[#06080d] font-bold text-xs hover:bg-[#0be08a] transition-all flex items-center gap-2 font-tech tracking-wider uppercase shadow-[0_0_15px_rgba(13,245,151,0.25)] disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'CHECKING...' : 'CHECK FOR UPDATES'}</span>
          </button>
        </div>

        {/* Update Status Details Box */}
        <div className="p-4 rounded-xl bg-[#07090f] border border-[#141926] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-tech">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">CURRENT INSTALLED VERSION:</span>
              <span className="px-2 py-0.5 rounded bg-[#0d121e] border border-[#1d273a] text-slate-100 font-bold">
                v1.0.0
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Last Checked: {updateState.lastChecked || 'Just now'}
            </div>
          </div>

          {/* Status Message Display */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0a0d15] border border-[#141a28]">
            {updateState.status === 'checking' && (
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0 mt-0.5" />
            )}
            {updateState.status === 'available' && (
              <Download className="w-4 h-4 text-[#0df597] shrink-0 mt-0.5" />
            )}
            {updateState.status === 'downloading' && (
              <Download className="w-4 h-4 text-cyan-400 animate-bounce shrink-0 mt-0.5" />
            )}
            {updateState.status === 'up-to-date' && (
              <CheckCircle2 className="w-4 h-4 text-[#0df597] shrink-0 mt-0.5" />
            )}
            {updateState.status === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            {updateState.status === 'idle' && (
              <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-tech font-semibold text-slate-200">
                  STATUS: {updateState.status.toUpperCase()}
                </span>
                {updateState.percent !== undefined && (
                  <span className="text-xs font-mono-tech text-cyan-400">
                    {updateState.percent}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {updateState.message}
              </p>

              {/* Progress bar if downloading */}
              {updateState.percent !== undefined && (
                <div className="w-full bg-[#121622] h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#0df597] h-full transition-all duration-300 shadow-[0_0_10px_#0df597]"
                    style={{ width: `${updateState.percent}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Developer Status Simulation Controls (Allows user to preview all states) */}
          <div className="pt-2 border-t border-[#121622] flex flex-wrap items-center gap-2 text-[10px] font-mono-tech">
            <span className="text-slate-500">PREVIEW STATE:</span>
            {(['checking', 'available', 'downloading', 'up-to-date', 'error'] as UpdateStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => simulateUpdateStatus(st)}
                className={`px-2 py-0.5 rounded border transition-all ${
                  updateState.status === st
                    ? 'bg-[#121927] text-[#0df597] border-[#22314d]'
                    : 'bg-[#080a11] text-slate-400 border-[#141824] hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PACKAGE.JSON SPECIFICATIONS (Requirement 3) */}
      <div className="p-5 rounded-2xl bg-[#0b0e16] border border-[#161c2b] space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#141825] pb-3">
          <HardDrive className="w-4 h-4 text-[#0df597]" />
          <div>
            <h2 className="text-sm font-tech font-bold text-slate-200 uppercase tracking-wide">
              Package & Build Configuration
            </h2>
            <span className="text-[10px] font-mono-tech text-slate-500">
              PACKAGE.JSON & ELECTRON-BUILDER ARTIFACTS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono-tech text-xs">
          <div className="p-3 rounded-xl bg-[#07090f] border border-[#141926]">
            <div className="text-[10px] text-slate-500">APPLICATION NAME</div>
            <div className="text-slate-200 font-bold mt-0.5">jarvis</div>
            <div className="text-[10px] text-slate-500 mt-1">productName: &quot;Jarvis&quot;</div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090f] border border-[#141926]">
            <div className="text-[10px] text-slate-500">APPLICATION ID</div>
            <div className="text-slate-200 font-bold mt-0.5">com.ahsan.jarvis</div>
            <div className="text-[10px] text-slate-500 mt-1">Version: 1.0.0</div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090f] border border-[#141926]">
            <div className="text-[10px] text-slate-500">BUILD TARGET</div>
            <div className="text-slate-200 font-bold mt-0.5">Windows NSIS</div>
            <div className="text-[10px] text-slate-500 mt-1">Dist Script: electron-builder</div>
          </div>
        </div>
      </div>

      {/* GENERAL DESKTOP SETTINGS (Requirement 4) */}
      <div className="p-5 rounded-2xl bg-[#0b0e16] border border-[#161c2b] space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#141825] pb-3">
          <Sliders className="w-4 h-4 text-[#0df597]" />
          <div>
            <h2 className="text-sm font-tech font-bold text-slate-200 uppercase tracking-wide">
              General Desktop Preferences
            </h2>
            <span className="text-[10px] font-mono-tech text-slate-500">
              RUNTIME ENVIRONMENT BEHAVIORS
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs font-sans">
          {/* Toggle 1: Auto Launch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090f] border border-[#141926]">
            <div>
              <div className="text-slate-200 font-medium">Launch on System Startup</div>
              <div className="text-[11px] text-slate-500 font-mono-tech">
                Automatically initialize Jarvis background service on OS boot
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoLaunch(!autoLaunch)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                autoLaunch ? 'bg-[#0df597]' : 'bg-[#182030]'
              }`}
            >
              <div
                className={`bg-[#06080d] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoLaunch ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Hardware Acceleration */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090f] border border-[#141926]">
            <div>
              <div className="text-slate-200 font-medium">Hardware Acceleration</div>
              <div className="text-[11px] text-slate-500 font-mono-tech">
                Leverage GPU for particle canvas and high-frequency animations
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHardwareAccel(!hardwareAccel)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                hardwareAccel ? 'bg-[#0df597]' : 'bg-[#182030]'
              }`}
            >
              <div
                className={`bg-[#06080d] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  hardwareAccel ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Start Minimized */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090f] border border-[#141926]">
            <div>
              <div className="text-slate-200 font-medium">Start Minimized to System Tray</div>
              <div className="text-[11px] text-slate-500 font-mono-tech">
                Keep neural listener resident in Windows Notification Area
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStartMinimized(!startMinimized)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                startMinimized ? 'bg-[#0df597]' : 'bg-[#182030]'
              }`}
            >
              <div
                className={`bg-[#06080d] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  startMinimized ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4: Frameless Window */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090f] border border-[#141926]">
            <div>
              <div className="text-slate-200 font-medium">Frameless Title Bar Mode</div>
              <div className="text-[11px] text-slate-500 font-mono-tech">
                Toggle between native OS window chrome and embedded header controls
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFramelessMode(!framelessMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                framelessMode ? 'bg-[#0df597]' : 'bg-[#182030]'
              }`}
            >
              <div
                className={`bg-[#06080d] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  framelessMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
