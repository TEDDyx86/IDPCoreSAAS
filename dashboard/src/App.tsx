import React, { useState } from 'react';
import { LayoutGrid, ListTodo, Terminal as TerminalIcon, X, FileText } from 'lucide-react';
import db from './data/db.json';

// Import Components
import StatusHeader from './components/StatusHeader';
import CourseCard from './components/CourseCard';
import ActivityTimeline from './components/ActivityTimeline';
import TerminalPanel from './components/TerminalPanel';

const App: React.FC = () => {
  const [data] = useState(db);
  const [selectedResumo, setSelectedResumo] = useState<any>(null);

  const handleOpenResumo = (item: any) => {
    setSelectedResumo(item);
  };

  const handleCloseModal = () => {
    setSelectedResumo(null);
  };

  return (
    <div className="dashboard-container">
      {/* 1. Header Global */}
      <StatusHeader 
        ultimaAtualizacao={data.metadados.ultima_atualizacao}
        totalDisciplinas={data.metadados.total_disciplinas}
        totalMateriais={data.metadados.total_materiais}
      />

      {/* 2. Grid de Disciplinas */}
      <section className="animate-fade" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-gradient">
          <LayoutGrid size={24} color="hsl(var(--accent-purple))" /> 
          Disciplinas em Foco
        </h2>
        <div className="grid-main">
          {data.disciplinas.map((disc) => (
            <CourseCard 
              key={disc.id}
              nome={disc.nome}
              id={disc.id}
              githubUrl={disc.github_url}
            />
          ))}
        </div>
      </section>

      {/* 3. Timeline de Atividades */}
      <section className="animate-fade" style={{ animationDelay: '0.4s', maxWidth: '900px' }}>
        <h2 className="text-gradient">
          <ListTodo size={24} color="hsl(var(--accent-cyan))" />
          Feed Acadêmico
        </h2>
        <ActivityTimeline 
          items={data.historico} 
          onOpenResumo={handleOpenResumo}
        />
      </section>

      {/* 4. Terminal de Sistema */}
      <section className="animate-fade" style={{ animationDelay: '0.6s' }}>
        <TerminalPanel />
      </section>

      {/* Footer Final */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '3rem 0', 
        color: 'hsl(var(--text-muted))', 
        fontSize: '0.8rem',
        borderTop: '1px solid hsla(var(--border-glass))',
        marginTop: '2rem'
      }}>
        <p>© 2026 IDP Core Infrastructure. Deploy by Vercel.</p>
      </footer>

      {/* Modal de Resumo IA */}
      {selectedResumo && (
        <div 
          onClick={handleCloseModal}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(8px)', 
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="glass animate-fade" 
            style={{ 
              width: '100%', 
              maxWidth: '700px', 
              maxHeight: '85vh', 
              overflowY: 'auto', 
              position: 'relative',
              padding: '2.5rem'
            }}
          >
            <button 
              onClick={handleCloseModal}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>RESUMO IA GERADO</span>
              <h2 style={{ marginBottom: '0.25rem' }}>{selectedResumo.titulo}</h2>
              <p style={{ color: 'hsl(var(--accent-purple))', fontWeight: 600 }}>{selectedResumo.disciplina}</p>
            </div>

            <div style={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: '1.8', 
              color: 'hsl(var(--text-primary))', 
              fontSize: '1.05rem',
              background: 'hsla(var(--bg-secondary), 0.5)',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid hsla(var(--border-glass))'
            }}>
              {selectedResumo.resumo}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleCloseModal}
                className="glass" 
                style={{ padding: '0.75rem 1.5rem', background: 'hsl(var(--accent-cyan))', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer', borderRadius: '12px' }}
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
