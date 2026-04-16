import React from 'react';
import { BookOpen, Github, ArrowUpRight } from 'lucide-react';

interface CourseCardProps {
  nome: string;
  id: string;
  githubUrl?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ nome, id, githubUrl }) => {
  return (
    <div className="glass glass-hover animate-fade" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div className="badge badge-purple" style={{ padding: '6px' }}>
          <BookOpen size={14} />
        </div>
        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noreferrer" className="badge badge-cyan" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <Github size={12} /> REPO
          </a>
        )}
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', flex: 1 }}>{nome}</h3>
      
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid hsla(var(--border-glass))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace' }}>ID: {id}</span>
        <button style={{ 
          background: 'none', 
          border: 'none', 
          color: 'hsl(var(--accent-cyan))', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          fontSize: '0.8rem', 
          fontWeight: 600, 
          cursor: 'pointer' 
        }}>
          Disciplinas <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
