import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

interface CourseCardProps {
  nome: string;
  id: string;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ nome, onClick }) => {
  return (
    <div className="module-card" onClick={onClick}>
      <div className="module-header">
        <div className="badge badge-cyan" style={{ padding: '9px' }}>
          <BookOpen size={15} />
        </div>
        <span className="module-label">Módulo Ativo</span>
      </div>

      <p className="module-name">{nome}</p>

      <div className="module-footer">
        <div className="module-progress-track">
          <div className="module-progress-fill" />
        </div>
        <ArrowRight size={17} className="module-arrow" />
      </div>
    </div>
  );
};

export default CourseCard;
