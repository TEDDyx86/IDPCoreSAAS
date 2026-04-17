import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Cpu, Globe } from 'lucide-react';

const TerminalPanel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const initialLogs = [
      '[SYSTEM] IDP CORE ONYX INITIALIZED',
      '[AUTH] RLS POLICIES APPLIED',
      '[NET] HANDSHAKE WITH SUPABASE EDGE SUCCESSFUL',
      '[SYNC] LISTENING FOR INCOMING ACADEMIC DATA...',
    ];
    setLogs(initialLogs);

    // Simulated real-time logs
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const events = [
        `[SCAN] CHECKING DATA SOURCES AT ${timestamp}`,
        `[AUTH] REFRESHING SESSION TOKEN...`,
        `[SYNC] NO LATENCY DETECTED`,
        `[AI] GEMINI ANALYSIS ENGINE READY`,
        `[SYS] MEMORY OPTIMIZATION COMPLETE`
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [...prev.slice(-12), randomEvent]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass glass-card" style={{ height: 'calc(100vh - 400px)', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid hsla(var(--glass-border))', paddingBottom: '1rem' }}>
        <TerminalIcon size={18} className="text-gradient" />
        <h2 style={{ fontSize: '0.8rem', letterSpacing: '0.2em', margin: 0 }}>SECURITY_CONSOLE</h2>
        <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }}></div>
           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }}></div>
           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }}></div>
        </div>
      </div>

      <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', color: 'hsl(var(--accent-cyan))', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', opacity: (i + 1) / logs.length }}>
            <span style={{ color: 'hsl(var(--text-ghost))' }}>[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span style={{ color: log.includes('ERR') ? '#ff4d4d' : 'inherit' }}>{log}</span>
          </div>
        ))}
        <div className="pulse-animation" style={{ width: '8px', height: '12px', background: 'hsl(var(--accent-cyan))', marginTop: '4px' }}></div>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid hsla(var(--glass-border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 700 }} className="font-display">
          <Cpu size={12} /> ENGINE_V2.4
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--success))' }} className="font-display">
          <Globe size={12} /> REGIONAL_EDGE_NODE
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
