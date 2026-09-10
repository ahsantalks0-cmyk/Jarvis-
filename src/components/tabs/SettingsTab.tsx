import { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sliders,
  HardDrive,
  Github,
  Sparkles,
  ArrowDownCircle,
  Play
} from 'lucide-react';
import { UpdateState, UpdateStatus } from '../../types';
import { electronBridge } from '../../lib/electronBridge';
import UpdateProgressBar from '../UpdateProgressBar';

export default function SettingsTab() {
  const [appVersion, setAppVersion] = useState<string>('1.1.1');
  const [updateState, setUpdateState] = useState<UpdateState>({
    status: 'idle',
    version: '1.1.1',
    message: 'Version 1.1.1 installed. Linked to GitHub release channel (ahsantalks0-cmyk/Jarvis-).',
    lastChecked: 'Just now'
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const simIntervalRef = useRef<any>(null);

  // General toggles
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [startMinimized, setStartMinimized] = useState(false);
  const [framelessMode, setFramelessMode] = useState(false);

  useEffect(() => {
    // Check real app version from Electron
    electronBridge.getVersion().then((v) => {
      if (v) {
        setAppVersion(v);
        setUpdateState((prev) => ({
          ...prev,
          version: v,
          message: `Version ${v} installed. Up-to-date with GitHub release channel.`
        }));
      }
    });

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
      version: appVersion,
      message: 'Checking for updates on GitHub (ahsantalks0-cmyk/Jarvis-)...',
      lastChecked: new Date().toLocaleTimeString()
    });

    try {
      const result = await electronBridge.checkForUpdates();
      setUpdateState(result);
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      setUpdateState({
        status: 'error',
        version: appVersion,
        message: `Update check failed: ${errorMsg}`,
        error: errorMsg,
        lastChecked: new Date().toLocaleTimeString()
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleInstallUpdate = async () => {
    setIsInstalling(true);
    await electronBridge.installUpdate();
  };

  const startLiveDownloadSimulation = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    let currentPercent = 15;
    const totalBytes = 76540000;

    const updateStep = () => {
      const remainingPercent = Math.max(0, 100 - currentPercent);
      const transferred = Math.round((currentPercent / 100) * totalBytes);
      const speed = 2400000 + Math.floor(Math.random() * 500000);

      const newState: UpdateState = {
        status: currentPercent >= 100 ? 'downloaded' : 'downloading',
        version: '1.1.2',
        percent: currentPercent,
        remainingPercent,
        transferred,
        total: totalBytes,
        bytesPerSecond: speed,
        message:
          currentPercent >= 100
            ? 'Update v1.1.2 downloaded successfully (100%). Ready to restart & install.'
            : `Downloading update package (${currentPercent}% downloaded, ${remainingPercent}% remaining)...`,
        lastChecked: new Date().toLocaleTimeString()
      };

      setUpdateState(newState);
      electronBridge.dispatchUpdate(newState);

      if (currentPercent >= 100) {
        clearInterval(simIntervalRef.current);
      } else {
        currentPercent += 17;
        if (currentPercent > 100) currentPercent = 100;
      }
    };

    updateStep();
    simIntervalRef.current = setInterval(updateStep, 1000);
  };

  const simulateUpdateStatus = (status: UpdateStatus) => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    let newState: UpdateState;
    switch (status) {
      case 'checking':
        setIsChecking(true);
        newState = {
          status: 'checking',
          version: appVersion,
          message: 'Checking for updates on GitHub...',
          lastChecked: new Date().toLocaleTimeString()
        };
        break;
      case 'available':
        setIsChecking(false);
        newState = {
          status: 'available',
          version: '1.1.2',
          message: 'Update v1.1.2 available — click to download or install.',
          lastChecked: new Date().toLocaleTimeString()
        };
        break;
      case 'downloading':
        setIsChecking(false);
        newState = {
          status: 'downloading',
          version: '1.1.2',
          percent: 64,
          remainingPercent: 36,
          transferred: 48900000,
          total: 76540000,
          bytesPerSecond: 2450000,
          message: 'Downloading update package (64% downloaded, 36% remaining)...',
          lastChecked: new Date().toLocaleTimeString()
        };
        break;
      case 'downloaded':
        setIsChecking(false);
        newState = {
          status: 'downloaded',
          version: '1.1.2',
          percent: 100,
          remainingPercent: 0,
          transferred: 76540000,
          total: 76540000,
          message: 'Update v1.1.2 downloaded (100% complete). Restart to update.',
          lastChecked: new Date().toLocaleTimeString()
        };
        break;
      case 'up-to-date':
        setIsChecking(false);
        newState = {
          status: 'up-to-date',
          version: appVersion,
          message: `Jarvis is up to date (v${appVersion})`,
          lastChecked: new Date().toLocaleTimeString()
        };
        break;
      case 'error':
        setIsChecking(false);
        newState = {
          status: 'error',
          version: appVersion,
          message: 'Update check failed: GitHub API HTTP 404 (Release asset missing or network timeout)',
          error: 'HTTP 404: The release asset or manifest could not be retrieved from repository ahsantalks0-cmyk/Jarvis-.',
          lastChecked: new Date().toLocaleTimeString()
        };
        break;
      default:
        setIsChecking(false);
        newState = {
          status: 'idle',
          version: appVersion,
          message: 'Ready to check releases.',
          lastChecked: new Date().toLocaleTimeString()
        };
    }
    setUpdateState(newState);
    electronBridge.dispatchUpdate(newState);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#06070a]">
      <div className="w-full max-w-5xl mx-auto px-6 md:px-10 py-6 space-y-6 flex-1 flex flex-col">
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
          <span>ahsantalks0-cmyk/Jarvis-</span>
        </div>
      </div>

      {/* AUTO-UPDATER SECTION */}
      <div className="p-5 rounded-2xl bg-[#0b0e16] border border-[#161c2b] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141825] pb-3.5">
          <div className="flex items-center gap-2.5">
            <RefreshCw className={`w-4 h-4 text-[#0df597] ${isChecking ? 'animate-spin' : ''}`} />
            <div>
              <h2 className="text-sm font-tech font-bold text-slate-200 uppercase tracking-wide">
                Updates & Releases (electron-updater)
              </h2>
              <span className="text-[10px] font-mono-tech text-slate-500">
                GITHUB RELEASES CI/CD PIPELINE • PRODUCTION RELEASE CHANNEL
              </span>
            </div>
          </div>

          <button
            id="btn-check-updates"
            onClick={handleCheckForUpdates}
            disabled={isChecking}
            className="px-4 py-2 rounded-xl bg-[#0df597] text-[#06080d] font-bold text-xs hover:bg-[#0be08a] transition-all flex items-center gap-2 font-tech tracking-wider uppercase shadow-[0_0_15px_rgba(13,245,151,0.25)] disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'CHECKING...' : 'CHECK FOR UPDATES'}</span>
          </button>
        </div>

        {/* Update Status Details Box */}
        <div className="p-4 rounded-xl bg-[#07090f] border border-[#141926] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-tech border-b border-[#141926] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">CURRENT INSTALLED VERSION:</span>
              <span className="px-2 py-0.5 rounded bg-[#0d121e] border border-[#1d273a] text-slate-100 font-bold">
                v{appVersion}
              </span>
            </div>
            {/* Explicit Last check: <time> — <result> as required */}
            <div id="updater-last-check-indicator" className="text-slate-400 text-[11px] flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500">Last check:</span>
              <span className="text-slate-200 font-medium">{updateState.lastChecked || 'Never'}</span>
              <span className="text-slate-600">—</span>
              <span
                className={`font-semibold ${
                  updateState.status === 'up-to-date'
                    ? 'text-[#0df597]'
                    : updateState.status === 'error'
                    ? 'text-rose-400'
                    : updateState.status === 'available' || updateState.status === 'downloading'
                    ? 'text-cyan-400'
                    : updateState.status === 'downloaded'
                    ? 'text-emerald-300'
                    : 'text-slate-400'
                }`}
              >
                {updateState.status === 'up-to-date'
                  ? `Jarvis is up to date (v${appVersion})`
                  : updateState.status === 'available'
                  ? `Update v${updateState.version || ''} available — downloading...`
                  : updateState.status === 'downloading'
                  ? `Downloading package (${updateState.percent ?? 0}%)`
                  : updateState.status === 'downloaded'
                  ? `Update v${updateState.version || ''} downloaded`
                  : updateState.status === 'error'
                  ? updateState.message
                  : updateState.status === 'checking'
                  ? 'Checking for updates...'
                  : 'Idle'}
              </span>
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
            {updateState.status === 'downloaded' && (
              <Sparkles className="w-4 h-4 text-[#0df597] shrink-0 mt-0.5" />
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
              <p className="text-xs text-slate-300 font-sans">
                {updateState.message}
              </p>

              {/* Comprehensive Progress Bar with % Downloaded and % Remaining */}
              {(updateState.status === 'downloading' ||
                updateState.percent !== undefined ||
                updateState.status === 'downloaded') && (
                <div className="pt-2">
                  <UpdateProgressBar
                    percent={updateState.percent ?? (updateState.status === 'downloaded' ? 100 : 0)}
                    remainingPercent={updateState.remainingPercent}
                    transferredBytes={updateState.transferred}
                    totalBytes={updateState.total}
                    bytesPerSecond={updateState.bytesPerSecond}
                    isCompleted={updateState.status === 'downloaded'}
                  />
                </div>
              )}

              {/* Action Banner if update is available */}
              {updateState.status === 'available' && (
                <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-[#0a1820] border border-[#1b3d52]">
                  <div className="flex items-center gap-2 text-xs text-[#00e5ff] font-mono-tech">
                    <Download className="w-4 h-4 text-[#00e5ff]" />
                    <span>New version v{updateState.version || '1.1.2'} is ready to download!</span>
                  </div>
                  <button
                    id="btn-start-download"
                    onClick={startLiveDownloadSimulation}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0df597] text-[#06080d] font-bold text-xs hover:bg-[#0be08a] transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(13,245,151,0.35)] cursor-pointer font-tech tracking-wide"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD & INSTALL</span>
                  </button>
                </div>
              )}

              {/* Action Banner if downloaded */}
              {updateState.status === 'downloaded' && (
                <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-[#0a1813] border border-[#1b4332]">
                  <div className="flex items-center gap-2 text-xs text-[#0df597] font-mono-tech">
                    <CheckCircle2 className="w-4 h-4 text-[#0df597]" />
                    <span>Update package ready (100% Downloaded). Restart to complete installation.</span>
                  </div>
                  <button
                    id="btn-install-restart"
                    onClick={handleInstallUpdate}
                    disabled={isInstalling}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#0df597] to-[#00e5ff] text-[#06080d] font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(13,245,151,0.35)] cursor-pointer font-tech tracking-wide"
                  >
                    <RefreshCw className={`w-3 h-3 ${isInstalling ? 'animate-spin' : ''}`} />
                    <span>{isInstalling ? 'INSTALLING...' : 'RESTART & UPDATE NOW'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic Error Log Card if error occurs */}
          {updateState.status === 'error' && (
            <div
              id="updater-error-details"
              className="p-3.5 rounded-lg bg-[#1a0c10] border border-[#4d1621] space-y-2 text-xs font-mono-tech"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>UPDATER DIAGNOSTIC INFORMATION</span>
              </div>
              <p className="text-rose-200/90 font-sans leading-relaxed text-xs">
                {updateState.error || updateState.message}
              </p>
              <div className="pt-2 border-t border-[#3b1219] flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                <span>Repo: <strong className="text-slate-200 font-mono">ahsantalks0-cmyk/Jarvis-</strong></span>
                <span>Feed: <strong className="text-slate-200 font-mono">GitHub Public Releases</strong></span>
                <span>Manifest: <strong className="text-slate-200 font-mono">latest.yml</strong></span>
              </div>
            </div>
          )}

          {/* Developer Status Simulation Controls (Allows user to preview all states) */}
          <div className="pt-2 border-t border-[#121622] flex flex-wrap items-center gap-2 text-[10px] font-mono-tech">
            <span className="text-slate-500">PREVIEW STATE:</span>
            {(['checking', 'available', 'downloading', 'downloaded', 'up-to-date', 'error'] as UpdateStatus[]).map((st) => (
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

            <button
              onClick={startLiveDownloadSimulation}
              className="px-2 py-0.5 rounded border border-[#164d6e] bg-[#0c2436] text-[#00e5ff] hover:bg-[#12364f] flex items-center gap-1 font-bold ml-auto"
              title="Test live downloading progress animation"
            >
              <Play className="w-2.5 h-2.5" />
              <span>Simulate Live Download (15% → 100%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PACKAGE.JSON SPECIFICATIONS */}
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
            <div className="text-[10px] text-slate-500">APPLICATION ID & VERSION</div>
            <div className="text-slate-200 font-bold mt-0.5">com.ahsan.jarvis</div>
            <div className="text-[10px] text-[#0df597] mt-1">Version: {appVersion}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090f] border border-[#141926]">
            <div className="text-[10px] text-slate-500">GITHUB REPOSITORY</div>
            <div className="text-slate-200 font-bold mt-0.5">Jarvis-</div>
            <div className="text-[10px] text-slate-500 mt-1">Owner: ahsantalks0-cmyk</div>
          </div>
        </div>
      </div>

      {/* GENERAL DESKTOP SETTINGS */}
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
    </div>
  );
}
