import { useState } from 'react';
import {
  Layers,
  Plus,
  Terminal,
  Code,
  Globe,
  Radio,
  ExternalLink,
  Shield,
  Smartphone,
  Check,
  Search
} from 'lucide-react';

export default function ThirdPartyAppsTab() {
  const [showUplinkModal, setShowUplinkModal] = useState(false);
  const [ipAddress, setIpAddress] = useState('192.168.1.45');
  const [port, setPort] = useState('5555');
  const [search, setSearch] = useState('');

  const sampleApps = [
    { name: 'VS Code Studio', category: 'IDE / Editor', status: 'STANDBY', icon: Code },
    { name: 'Google Chrome', category: 'Web Browser', status: 'STANDBY', icon: Globe },
    { name: 'Windows Terminal', category: 'Shell Environment', status: 'INTEGRATED', icon: Terminal },
    { name: 'Blender 5.0', category: '3D Graphics Engine', status: 'STANDBY', icon: Layers },
    { name: 'Adobe After Effects', category: 'Motion Video', status: 'STANDBY', icon: Layers },
    { name: 'Slack Desktop', category: 'Team Communications', status: 'STANDBY', icon: Radio },
    { name: 'Spotify Music', category: 'Audio Media', status: 'STANDBY', icon: Radio },
    { name: 'Docker Desktop', category: 'Containerization', status: 'STANDBY', icon: Shield }
  ];

  const filtered = sampleApps.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#06070a]">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-6 space-y-6 flex-1 flex flex-col">
        {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0df597]" />
            <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
              System Applications & Integrations
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#0e1624] text-[#0df597] border border-[#1b283d]">
              INDEXED SOFTWARE LIBRARY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Local applications discovered on the host environment and remote communication channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-connect-apps"
            onClick={() => setShowUplinkModal(!showUplinkModal)}
            className="px-4 py-2 rounded-xl bg-[#0df597] text-[#06080d] font-semibold text-xs hover:bg-[#0be08a] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(13,245,151,0.25)] font-tech tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>CONNECT THIRD-PARTY APPS</span>
          </button>
        </div>
      </div>

      {/* Device Uplink Protocol (matching screenshot 2) */}
      {showUplinkModal && (
        <div className="p-5 rounded-2xl bg-[#0b0e16] border border-[#1e273a] space-y-4">
          <div className="flex items-center justify-between border-b border-[#161c2b] pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#0df597]" />
              <h3 className="text-xs font-tech font-bold text-slate-200 tracking-wider uppercase">
                Device Uplink & Protocol Setup
              </h3>
            </div>
            <span className="text-[10px] font-mono-tech text-slate-500">
              TCP/IP INITIALIZATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                  Target IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full mt-1 bg-[#07090f] border border-[#182030] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0df597]/60"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                  Target Port
                </label>
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full mt-1 bg-[#07090f] border border-[#182030] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0df597]/60"
                />
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-[#0df597] text-[#06080d] font-bold text-xs hover:bg-[#0be08a] transition-all font-tech tracking-wider uppercase"
              >
                ESTABLISH CONNECTION
              </button>
            </div>

            {/* Protocol Steps (Image 2 style) */}
            <div className="p-3.5 rounded-xl bg-[#07090f] border border-[#141926] space-y-2 text-xs font-mono-tech text-slate-400">
              <div className="text-[10px] text-slate-300 font-semibold tracking-wider">
                FIRST-TIME SETUP PROTOCOL
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#0e1724] border border-[#1a2d45] text-[#0df597] flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>Enable Wireless ADB / Local socket server on target device.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#0e1724] border border-[#1a2d45] text-[#0df597] flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>Pair host port with target daemon: <code className="text-slate-200 bg-[#0f1420] px-1 rounded">adb tcpip 5555</code></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#0e1724] border border-[#1a2d45] text-[#0df597] flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Sever physical cable & execute socket uplink.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search software catalog..."
          className="w-full pl-9 pr-3 py-2 bg-[#090c14] border border-[#161c2a] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df597]/50 font-sans"
        />
      </div>

      {/* Grid of Apps (matching screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filtered.map((app, idx) => {
          const Icon = app.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#090c14] border border-[#151a26] hover:border-[#222a3d] hover:bg-[#0c101a] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0e1320] border border-[#1b253b] flex items-center justify-center text-slate-400 group-hover:text-[#0df597] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 font-sans group-hover:text-slate-100">
                    {app.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono-tech">
                    {app.category}
                  </div>
                </div>
              </div>

              <span className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-[#07090f] border border-[#141926] text-slate-400">
                {app.status}
              </span>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
