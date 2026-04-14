import React, { useState } from 'react';
import db from './data/db.json';

const App: React.FC = () => {
  const [data] = useState(db);

  return (
    <div className="dashboard-container">
      {/* Header Dinâmico */}
      <header className="header-stats glass-card">
        <div>
          <h1>IDP Core Dashboard</h1>
          <p>Monitor Acadêmico Inteligente v3.0</p>
        </div>
        <div className="status-badge">
          <div className="status-dot"></div>
          Ativo | Sincronizado às {new Date(data.metadados.ultima_atualizacao).toLocaleTimeString()}
        </div>
      </header>

      {/* Grid de Disciplinas */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h2>Cursos em Monitoramento</h2>
          <span className="badge-new" style={{ background: '#30363d', color: '#fff' }}>
            {data.metadados.total_disciplinas} Ativos
          </span>
        </div>
        
        <div className="grid-disciplinas">
          {data.disciplinas.map(disc => (
            <div key={disc.id} className="discipline-card glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3>{disc.nome}</h3>
              </div>
              <p>ID: {disc.id}</p>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                <button className="glass-card" style={{ padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline de Resumos (IA) */}
      <section style={{ marginBottom: '4rem' }}>
        <h2>Últimas Aulas Processadas (IA)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {data.historico.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: item.status === 'PROCESSADO' ? '4px solid var(--accent-color)' : '4px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 800 }}>{item.tipo}</span>
                <span style={{ fontSize: '0.75rem' }}>{item.data}</span>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{item.titulo}</h3>
              <p style={{ color: '#f0f6fc', marginBottom: '1rem', opacity: 0.7 }}>{item.disciplina}</p>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px dashed #30363d', marginBottom: '1rem' }}>
                {item.resumo}
              </div>

              {item.status === 'PROCESSADO' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a href={item.links.resumo_docx} className="badge-new" style={{ textDecoration: 'none', background: 'var(--accent-color)', color: '#000', fontWeight: 'bold' }}>
                    Baixar Aula Magistral (.docx)
                  </a>
                  <a href={item.links.original} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#8b949e', alignSelf: 'center' }}>
                    Ver no Canvas
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer / Logs Estilo Terminal */}
      <footer className="glass-card" style={{ padding: '1rem', fontSize: '0.7rem', fontFamily: 'monospace', color: '#238636' }}>
        <div>[SYSTEM] Conectado ao BOT_IDP Repository...</div>
        <div>[SYSTEM] Banco de dados carregado com {data.metadados.total_materiais} materiais.</div>
        <div>[CLOUD] Monitoramento ativo 24/7 via GitHub Actions.</div>
      </footer>
    </div>
  );
};

export default App;
