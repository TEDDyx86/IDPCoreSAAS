import React from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  disciplina: string;
  titulo: string;
  descricao?: string;
  tipo: 'PROVA' | 'TRABALHO' | 'ATIVIDADE' | 'APRESENTACAO' | 'OUTRO';
  data_evento: string;
}

interface AcademicCalendarProps {
  events: CalendarEvent[];
  loading?: boolean;
}

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ events, loading = false }) => {
  
  const getBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'PROVA':
        return 'badge-red';
      case 'TRABALHO':
        return 'badge-cyan';
      case 'APRESENTACAO':
        return 'badge-purple';
      case 'ATIVIDADE':
        return 'badge-yellow';
      default:
        return 'badge-gray';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'PROVA':
        return 'Avaliação / Prova';
      case 'TRABALHO':
        return 'Entrega de Trabalho';
      case 'APRESENTACAO':
        return 'Apresentação / Seminário';
      case 'ATIVIDADE':
        return 'Atividade Avaliativa';
      default:
        return 'Compromisso Acadêmico';
    }
  };

  const calcularDiasRestantes = (dataStr: string) => {
    const dataEvento = new Date(dataStr + 'T00:00:00');
    const hoje = new Date();
    
    // Normalizar datas para o mesmo horário (meia-noite) para cálculo preciso em dias
    dataEvento.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    
    const diffTime = dataEvento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: 'Ocorre Hoje!', color: 'hsl(var(--ch-reject))', status: 'today' };
    } else if (diffDays === 1) {
      return { text: 'Amanhã!', color: 'hsl(var(--ch-ember))', status: 'tomorrow' };
    } else if (diffDays > 1) {
      return { text: `Faltam ${diffDays} dias`, color: 'hsl(var(--ch-plasma))', status: 'future' };
    } else {
      return { text: `Ocorreu há ${Math.abs(diffDays)} dias`, color: 'hsl(var(--ch-t2))', status: 'past' };
    }
  };

  if (loading) {
    return (
      <div className="font-display text-dim" style={{ textAlign: 'center', padding: '6rem' }}>
        <div className="pulse-animation" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>☇</div>
        Extraindo cronograma acadêmico...
      </div>
    );
  }

  // Ordena os eventos por data de forma ascendente (os mais próximos primeiro)
  const sortedEvents = [...events].sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime());

  if (sortedEvents.length === 0) {
    return (
      <div className="glass glass-card" style={{ padding: '4rem', textAlign: 'center', opacity: 0.6 }}>
        <Calendar size={32} opacity={0.3} style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
        <p className="font-display" style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>Nenhum compromisso detectado.</p>
        <p className="text-dim" style={{ fontSize: '0.8rem', marginTop: '0.5rem', margin: 0 }}>
          O Onyx Engine analisará os Planos de Ensino em formato PDF anexados no Canvas para mapear datas importantes.
        </p>
      </div>
    );
  }

  return (
    <div className="academic-calendar-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {sortedEvents.map((event, index) => {
        const { text: diasText, color: diasColor, status: diasStatus } = calcularDiasRestantes(event.data_evento);
        const isPast = diasStatus === 'past';

        return (
          <div 
            key={event.id || index}
            className="timeline-item animate-reveal"
            style={{ 
              animationDelay: `${0.05 * index}s`,
              opacity: isPast ? 0.65 : 1
            }}
          >
            <div className="timeline-dot" style={{ background: isPast ? 'hsl(var(--ch-t2))' : 'hsl(var(--ch-plasma))', boxShadow: isPast ? 'none' : undefined }} />
            
            <div className="timeline-date">
              <Clock size={12} opacity={0.5} />
              {new Date(event.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            
            <div
              className="glass glass-card glass-hover"
              style={{
                padding: '2rem',
                borderColor: isPast ? 'var(--border)' : 'hsla(var(--ch-plasma), 0.18)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{event.disciplina}</span>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-hi)' }} />
                    <span className={`badge ${getBadgeClass(event.tipo)}`} style={{ fontSize: '0.65rem' }}>
                      {getTipoLabel(event.tipo)}
                    </span>
                  </div>
                  
                  <h3 className="font-display" style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 600, 
                    margin: 0, 
                    lineHeight: '1.3',
                    color: isPast ? 'hsl(var(--ch-t2))' : 'hsl(var(--ch-t0))'
                  }}>
                    {event.titulo}
                  </h3>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: diasColor,
                  background: 'var(--surface-2)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: `1px solid ${isPast ? 'var(--border)' : 'hsla(var(--ch-plasma), 0.18)'}`,
                  whiteSpace: 'nowrap'
                }}>
                  {isPast ? <CheckCircle size={14} opacity={0.6} /> : <AlertCircle size={14} />}
                  <span>{diasText}</span>
                </div>
              </div>
              
              {event.descricao && (
                <p className="text-dim" style={{ 
                  fontSize: '0.9rem', 
                  lineHeight: '1.5', 
                  margin: 0, 
                  marginTop: '1.25rem',
                  opacity: 0.8
                }}>
                  {event.descricao}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AcademicCalendar;
