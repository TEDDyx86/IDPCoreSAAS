import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

interface CourseCardProps {
  nome: string;
  id: string;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ nome, onClick }) => {
  return (
    <div 
      className="glass glass-card glass-hover" 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2.5rem', 
        padding: '2.5rem',
        height: '100%',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="badge badge-cyan" style={{ padding: '10px' }}>
          <BookOpen size={16} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1,2,3].map(i => <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white', opacity: 0.15 }} />)}
        </div>
      </div>
      
      <div>
        <h3 className="font-display" style={{ 
          fontSize: '1.25rem', 
          lineHeight: '1.4',
          fontWeight: 600,
          color: 'white',
          marginBottom: '0.6rem'
        }}>
          {nome}
        </h3>
        <p className="text-dim" style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 400 }}>Módulo de Estudos Ativo</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ 
            width: '65%', 
            height: '100%', 
            background: 'white', 
            boxShadow: '0 0 15px white',
            borderRadius: '10px'
          }}></div>
        </div>
        <ArrowRight size={20} className="text-dim" style={{ opacity: 0.3 }} />
      </div>
    </div>
  );
};

export default CourseCard;
