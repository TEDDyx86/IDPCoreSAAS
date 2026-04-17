import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

interface CourseCardProps {
  nome: string;
  id: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ nome, id }) => {
  return (
    <div className="glass glass-card glass-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="badge badge-cyan" style={{ padding: '8px' }}>
          <BookOpen size={14} />
        </div>
        <span className="text-dim font-display" style={{ fontSize: '0.6rem', fontWeight: 800 }}>MODULE_ID: {id.slice(0, 6)}</span>
      </div>
      
      <div style={{ flex: 1 }}>
        <h3 className="font-display" style={{ fontSize: '1rem', letterSpacing: '0.02em', textTransform: 'none', margin: 0, color: 'white' }}>
          {nome}
        </h3>
      </div>

      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
        <div style={{ width: '100%', height: '2px', background: 'hsla(var(--glass-border))', borderRadius: '1px' }}>
          <div style={{ width: '40%', height: '100%', background: 'hsl(var(--accent-cyan))', boxShadow: '0 0 10px hsl(var(--accent-cyan))' }}></div>
        </div>
        <ChevronRight size={14} className="text-dim" />
      </div>
    </div>
  );
};

export default CourseCard;
