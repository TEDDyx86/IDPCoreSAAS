import React from 'react';
import { Terminal as TerminalIcon, Cpu, Globe } from 'lucide-react';

const TerminalPanel: React.FC = () => {
  const logs = [
    { type: 'SYS', msg: 'Monitor Acadêmico Inicializado v3.1', time: '08:00:01' },
    { type: 'NET', msg: 'Conexão estabelecida com Campus IDP (Canvas API)', time: '08:00:05' },
    { type: 'BOT', msg: 'Varredura completa: 0 novos materiais detectados', time: '20:15:33' },
    { type: 'GIT', msg: 'Monitorando repositórios: laboratório-poo, teoria-algoritmos', time: '20:15:35' },
    { type: 'AI', msg: 'Gemini-1.5-Flash pronto para processamento de resumos', time: '20:15:40' },
  ];

  return (
    <div className="glass" style={{ padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.8rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid hsla(var(--border-glass))', paddingBottom: '0.75rem' }}>
        <TerminalIcon size={16} color="hsl(var(--accent-green))" />
        <span style={{ fontWeight: 'bold' }}>BOT SYSTEM CONSOLE</span>
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', opacity: 1 - (i * 0.15) }}>
            <span style={{ color: 'hsl(var(--text-muted))' }}>[{log.time}]</span>
            <span style={{ 
              color: log.type === 'SYS' ? '#00d2ff' : log.type === 'GIT' ? '#bd93f9' : '#50fa7b',
              fontWeight: 'bold',
              minWidth: '40px'
            }}>[{log.type}]</span>
            <span style={{ color: 'hsl(var(--text-secondary))' }}>{log.msg}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ color: 'hsl(var(--text-muted))' }}>[LIVE]</span>
          <span style={{ color: '#50fa7b' }}>{'>'}</span>
          <span className="cursor-blink" style={{ width: '8px', height: '16px', background: 'hsl(var(--accent-green))' }}></span>
        </div>
      </div>

      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        padding: '1rem', 
        opacity: 0.05, 
        pointerEvents: 'none' 
      }}>
        <Globe size={120} />
      </div>

      <style>{`
        .cursor-blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default TerminalPanel;
