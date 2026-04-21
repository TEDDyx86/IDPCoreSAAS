import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Cpu, Globe } from 'lucide-react';

const TerminalPanel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const initialLogs = [
      '[SYSTEM] ONYX v3.0 BOOT SUCCESS',
      '[SEC] ENCRYPTED HANDSHAKE ESTABLISHED',
      '[LINK] CANVAS API SYNC: ONLINE',
      '[AI] PEDAGOGICAL ENGINE: READY',
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('pt-BR');
      const events = [
        `[SCAN] SYNCING CANVAS DATA...`,
        `[AUTH] REFRESHING TOKEN AT ${timestamp}`,
        `[SYNC] ZERO LATENCY CONNECTION`,
        `[SYS] MEMORY OPTIMIZATION ACTIVE`,
        `[AI] GEMINI PROCESSING COMPLETED`
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [...prev.slice(-14), randomEvent]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass glass-card" style={{ 
      height: 'calc(100vh - 350px)', 
      minHeight: '480px', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '1.25rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '1.5rem', 
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.03)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', opacity: 0.8 }}></div>
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', opacity: 0.8 }}></div>
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f', opacity: 0.8 }}></div>
          </div>
          <span className="font-display" style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsla(0,0%,100%,0.4)', letterSpacing: '0.1em' }}>TELEMETRY_FEED</span>
        </div>
        <TerminalIcon size={14} style={{ opacity: 0.3 }} />
      </div>

      <div style={{ 
        flex: 1, 
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', 
        fontSize: '0.75rem', 
        color: 'hsla(0,0%,100%,0.7)', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.6rem',
        padding: '0.5rem'
      }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', opacity: (i + 1) / logs.length }}>
            <span style={{ color: 'hsla(0,0%,100%,0.2)', minWidth: '55px' }}>{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
            <span style={{ 
              color: log.includes('ERR') ? '#ff5555' : log.includes('SUCCESS') ? '#27c93f' : 'inherit',
              fontWeight: log.includes('[') ? 500 : 400
            }}>{log}</span>
          </div>
        ))}
        <div className="pulse-animation" style={{ width: '6px', height: '12px', background: 'white', marginTop: '4px', opacity: 0.3 }}></div>
      </div>

      <div style={{ 
        marginTop: '1.5rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid rgba(255,255,255,0.03)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', fontWeight: 600 }} className="font-display">
          <Cpu size={12} style={{ opacity: 0.4 }} /> ONYX ENGINE v3.0
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }} className="font-display">
          <Globe size={12} style={{ opacity: 1 }} /> REGIONAL_NODE_LATAM
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
