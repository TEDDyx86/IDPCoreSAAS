import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle, BookOpen, Layers } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  disciplina: string;
  titulo: string;
  descricao?: string;
  tipo: 'PROVA' | 'TRABALHO' | 'ATIVIDADE' | 'APRESENTACAO' | 'OUTRO';
  data_evento: string;
}

interface TerminalPanelProps {
  events?: CalendarEvent[];
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ events = [] }) => {
  const [sortedEvents, setSortedEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (events && events.length > 0) {
      // Ordena por data (os mais próximos primeiro, mas excluindo ou jogando passados para o fim se desejado)
      // Aqui ordenamos de forma cronológica ascendente
      const sorted = [...events].sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime());
      setSortedEvents(sorted);
    } else {
      setSortedEvents([]);
    }
  }, [events]);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'PROVA':
        return '#ff5f56'; // Vermelho
      case 'TRABALHO':
        return '#00f2ff'; // Ciano
      case 'APRESENTACAO':
        return '#bd56ff'; // Roxo
      case 'ATIVIDADE':
        return '#ffbd2e'; // Amarelo
      default:
        return '#888888'; // Cinza
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'PROVA':
        return 'PROVA';
      case 'TRABALHO':
        return 'TRABALHO';
      case 'APRESENTACAO':
        return 'APRESENT.';
      case 'ATIVIDADE':
        return 'ATIVID.';
      default:
        return 'COMPROM.';
    }
  };

  const calcularDiasRestantes = (dataStr: string) => {
    const dataEvento = new Date(dataStr + 'T00:00:00');
    const hoje = new Date();
    
    dataEvento.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    
    const diffTime = dataEvento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: 'Hoje!', color: '#ffbd2e', status: 'today' };
    } else if (diffDays === 1) {
      return { text: 'Amanhã', color: '#ff7700', status: 'tomorrow' };
    } else if (diffDays > 1) {
      return { text: `${diffDays}d`, color: '#00f2ff', status: 'future' };
    } else {
      return { text: 'OK', color: 'rgba(255,255,255,0.2)', status: 'past' };
    }
  };

  return (
    <div className="glass glass-card" style={{ 
      height: 'calc(100vh - 350px)', 
      minHeight: '480px', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '1.25rem'
    }}>
      {/* Cabeçalho do Painel */}
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
          <span className="font-display" style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsla(0,0%,100%,0.4)', letterSpacing: '0.15em' }}>CALENDÁRIO_ACADÊMICO</span>
        </div>
        <CalendarIcon size={14} style={{ opacity: 0.3 }} />
      </div>

      {/* Lista de Eventos do Calendário */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        paddingRight: '0.25rem'
      }}>
        {sortedEvents.length === 0 ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            opacity: 0.4,
            textAlign: 'center',
            padding: '2rem'
          }}>
            <CalendarIcon size={24} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p className="font-display" style={{ fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>Nenhum compromisso mapeado.</p>
            <p style={{ fontSize: '0.65rem', marginTop: '0.25rem', margin: 0 }}>Sincronize o calendário acadêmico para popular as datas.</p>
          </div>
        ) : (
          sortedEvents.map((event, idx) => {
            const { text: diasText, color: diasColor, status: diasStatus } = calcularDiasRestantes(event.data_evento);
            const isPast = diasStatus === 'past';
            const shortDisc = event.disciplina.split('-')[0].trim();
            const discLabel = shortDisc.length > 18 ? shortDisc.substring(0, 18) + '...' : shortDisc;

            // Formatação compacta da data (ex: "13/04")
            const dateObj = new Date(event.data_evento + 'T00:00:00');
            const dataFormatada = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            return (
              <div 
                key={event.id || idx}
                className="glass-hover"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  background: isPast ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                  border: isPast ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(255,255,255,0.04)',
                  opacity: isPast ? 0.45 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Coluna da Data */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '38px',
                  height: '38px',
                  borderRadius: '6px',
                  background: isPast ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isPast ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: isPast ? '#666' : 'white' }}>
                    {dataFormatada.split('/')[0]}
                  </span>
                  <span style={{ fontSize: '0.55rem', opacity: 0.5, marginTop: '-2px', textTransform: 'uppercase' }}>
                    {dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                  </span>
                </div>

                {/* Informações do Compromisso */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '0.55rem', 
                      fontWeight: 700, 
                      color: getTipoColor(event.tipo),
                      letterSpacing: '0.05em'
                    }}>
                      {getTipoLabel(event.tipo)}
                    </span>
                    <span style={{ fontSize: '0.55rem', opacity: 0.3 }}>•</span>
                    <span style={{ 
                      fontSize: '0.55rem', 
                      opacity: 0.5, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      maxWidth: '120px'
                    }}>
                      {discLabel}
                    </span>
                  </div>

                  <h4 style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    margin: 0, 
                    color: isPast ? '#888' : 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.2'
                  }} title={event.titulo}>
                    {event.titulo}
                  </h4>
                </div>

                {/* Prazo Restante */}
                <div style={{ 
                  textAlign: 'right', 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  color: diasColor,
                  fontFamily: 'var(--font-display)',
                  minWidth: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.25rem'
                }}>
                  {isPast ? <CheckCircle size={10} opacity={0.5} /> : <AlertCircle size={10} />}
                  <span>{diasText}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé do Painel */}
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
          <Layers size={12} style={{ opacity: 1, color: '#00f2ff' }} /> COMPACT VIEW
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
