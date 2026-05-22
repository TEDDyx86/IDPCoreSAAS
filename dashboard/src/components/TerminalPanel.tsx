import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Cpu, Globe, BookOpen } from 'lucide-react';

interface AcademicUpdate {
  id: string;
  disciplina: string;
  titulo: string;
  data_detectado: string;
  resumo: string;
  links?: any;
}

interface TerminalPanelProps {
  updates?: AcademicUpdate[];
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ updates = [] }) => {
  const [feedItems, setFeedItems] = useState<{type: string, text: string, color: string, timestamp: string}[]>([]);

  useEffect(() => {
    if (!updates || updates.length === 0) {
      setFeedItems([
        { type: 'SYS', text: 'AGUARDANDO DADOS ACADÊMICOS...', color: 'hsla(0,0%,100%,0.4)', timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
      ]);
      return;
    }

    const items: {type: string, text: string, color: string, timestamp: string, origDate: Date}[] = [];

    updates.forEach(u => {
      const isCalendar = u.titulo.toLowerCase().includes('calendário') || u.titulo.toLowerCase().includes('calendario');
      const isActivity = u.titulo.toLowerCase().includes('atividade') || u.titulo.toLowerCase().includes('trabalho') || u.titulo.toLowerCase().includes('prova') || u.titulo.toLowerCase().includes('postagem');
      const isPlan = u.titulo.toLowerCase().includes('plano de ensino');
      
      let type = 'DOC';
      let color = 'hsla(0,0%,100%,0.7)';
      
      if (isCalendar) {
        type = 'CAL';
        color = '#ffbd2e'; // Yellow
      } else if (isActivity) {
        type = 'TASK';
        color = '#ff5f56'; // Red
      } else if (isPlan) {
        type = 'PLAN';
        color = '#27c93f'; // Green
      } else {
        type = 'INFO';
        color = '#56ccff'; // Blueish
      }

      // Extract brief discipline name
      const shortDisc = u.disciplina.split('-')[0].trim();
      const discLabel = shortDisc.length > 20 ? shortDisc.substring(0, 20) + '...' : shortDisc;

      items.push({
        type,
        text: `[${discLabel}] ${u.titulo}`,
        color,
        timestamp: new Date(u.data_detectado).toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        origDate: new Date(u.data_detectado)
      });
    });

    // Sort by date descending
    items.sort((a, b) => b.origDate.getTime() - a.origDate.getTime());
    
    setFeedItems(items);
  }, [updates]);

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
          <span className="font-display" style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsla(0,0%,100%,0.4)', letterSpacing: '0.1em' }}>CALENDÁRIO_ACADÊMICO</span>
        </div>
        <CalendarIcon size={14} style={{ opacity: 0.3 }} />
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
        {feedItems.slice(0, 30).map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', opacity: Math.max(0.3, 1 - (i * 0.03)) }}>
            <span style={{ color: 'hsla(0,0%,100%,0.2)', minWidth: '40px' }}>{log.timestamp}</span>
            <span style={{ color: log.color, minWidth: '45px', fontWeight: 600 }}>[{log.type}]</span>
            <span style={{ color: 'hsla(0,0%,100%,0.8)', flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}>
              {log.text}
            </span>
          </div>
        ))}
        {feedItems.length > 0 && (
          <div className="pulse-animation" style={{ width: '6px', height: '12px', background: 'white', marginTop: '4px', opacity: 0.3 }}></div>
        )}
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
          <BookOpen size={12} style={{ opacity: 0.4 }} /> ACADEMIC ENGINE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }} className="font-display">
          <Globe size={12} style={{ opacity: 1 }} /> LIVE FEED
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
