import React, { useState, useEffect } from 'react';
import { LayoutGrid, ListTodo, LogOut, Settings as SettingsIcon, X, Bell } from 'lucide-react';
import logo from './assets/logo.png';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';

interface AcademicUpdate {
  id: string;
  disciplina: string;
  titulo: string;
  data_detectado: string;
  resumo: string;
  links?: any;
}


import StatusHeader from './components/StatusHeader';
import CourseCard from './components/CourseCard';
import ActivityTimeline from './components/ActivityTimeline';
import TerminalPanel from './components/TerminalPanel';
import LoginPage from './components/LoginPage';
import ConfigPage from './components/ConfigPage';
import DisclaimerModal from './components/DisclaimerModal';
import LessonDetailOverlay from './components/LessonDetailOverlay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);
  const [updates, setUpdates] = useState<AcademicUpdate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedResumo, setSelectedResumo] = useState<AcademicUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carousel State
  const [scrollPos, setScrollPos] = useState(0);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Check if user has configuration and fetch profile info
  useEffect(() => {
    if (user) {
      const checkConfig = async () => {
        try {
          const { data, error } = await supabase
            .from('monitor_configs')
            .select('id, student_name, courses_list')
            .maybeSingle();
          
          if (error) throw error;
          setHasConfig(!!data);
          if (data?.student_name) setStudentName(data.student_name);
          if (data?.courses_list) setStudentCourses(data.courses_list);
          
        } catch (err: any) {
          console.error("Erro ao verificar configuração:", err);
          setError("Falha ao comunicar com o servidor.");
        }
      };
      checkConfig();
    }
  }, [user]);

  // Fetch updates from Supabase
  useEffect(() => {
    if (user && hasConfig) {
      const fetchUpdates = async () => {
        try {
          setLoadingData(true);
          const { data, error } = await supabase
            .from('academic_updates')
            .select('*')
            .order('data_detectado', { ascending: false });
          
          if (error) throw error;
          if (data) setUpdates(data);
        } catch (err: any) {
          console.error("Erro ao buscar atualizações:", err);
        } finally {
          setLoadingData(false);
        }
      };
      fetchUpdates();

      const subscription = supabase
        .channel('academic_updates_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'academic_updates' }, (payload) => {
          setUpdates(prev => [payload.new as AcademicUpdate, ...prev]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, hasConfig]);

  if (authLoading || (user && hasConfig === null)) {
    return (
      <div className="login-container">
        <div className="animate-fade" style={{ textAlign: 'center' }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ width: '80px', height: 'auto', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(0,242,255,0.2))' }} 
            className="pulse-animation" 
          />
          <p className="font-display" style={{ letterSpacing: '0.2em', fontSize: '0.8rem', opacity: 0.6 }}>Sincronizando Monitor...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  if (hasConfig === false || showConfig) return <ConfigPage onClose={() => setShowConfig(false)} />;

  const handleOpenResumo = (item: any) => setSelectedResumo(item);
  const handleCloseModal = () => setSelectedResumo(null);

  const totalDisciplinas = studentCourses.length || Array.from(new Set(updates.map((u: AcademicUpdate) => u.disciplina))).length;

  return (
    <div className="dashboard-container">
      <DisclaimerModal />
      {error && <div className="status-alert error">{error}</div>}
      
      <header className="user-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginRight: 'auto' }}>
          <img src={logo} alt="Logo" style={{ height: '54px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(0,242,255,0.15))' }} />
          <div className="badge badge-cyan" style={{ gap: '0.5rem' }}>
             <Bell size={12} /> Onyx Engine Active
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p className="font-display" style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
              {studentName || user.email?.split('@')[0]}
            </p>
            <p className="text-dim" style={{ fontSize: '0.65rem', margin: 0 }}>Sessão Protegida</p>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', border: '1px solid hsla(var(--primary), 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }} className="text-gradient">
            {(studentName || user.email || '?')[0].toUpperCase()}
          </div>
        </div>

        <button className="nav-btn" onClick={() => setShowConfig(true)}>
          <SettingsIcon size={14} />
        </button>
        <button className="nav-btn" style={{ background: 'rgba(255,50,50,0.1)', borderColor: 'rgba(255,50,50,0.2)', color: '#ff5555' }} onClick={signOut}>
          <LogOut size={14} /> Sair
        </button>
      </header>

      <StatusHeader 
        ultimaAtualizacao={updates[0]?.data_detectado || 'Nenhuma até agora'}
        totalDisciplinas={totalDisciplinas}
        totalMateriais={updates.length}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <section className="animate-fade" style={{ animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>
                <LayoutGrid size={20} className="text-gradient" /> 
                Módulos Detectados
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="nav-btn" onClick={() => scroll('left')}><ChevronLeft size={16} /></button>
                <button className="nav-btn" onClick={() => scroll('right')}><ChevronRight size={16} /></button>
              </div>
            </div>
            
            <div 
              ref={sliderRef}
              className="carousel-container" 
              style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                overflowX: 'hidden', 
                padding: '0.5rem',
                scrollBehavior: 'smooth'
              }}
            >
              {(studentCourses.length > 0 ? studentCourses : Array.from(new Set(updates.map((u: AcademicUpdate) => u.disciplina))).map(n => ({nome: n}))).map((course: any, idx: number) => (
                <div key={idx} style={{ minWidth: '320px', flex: 1 }}>
                  <CourseCard 
                    nome={course.nome || course.name}
                    id={String(course.id || idx)}
                  />
                </div>
              ))}
              {!loadingData && updates.length === 0 && studentCourses.length === 0 && (
                <div className="glass glass-card" style={{ width: '100%', textAlign: 'center' }}>
                  <p className="text-dim">O portal ainda não reportou novos dados. Sente-se e relaxe.</p>
                </div>
              )}
            </div>
          </section>

          <section className="animate-fade" style={{ animationDelay: '0.4s' }}>
            <h2>
              <ListTodo size={20} className="text-gradient" />
              Feed Acadêmico
            </h2>
            {loadingData ? (
              <div className="font-display text-dim" style={{ textAlign: 'center', padding: '4rem' }}>Interceptando fluxos de dados...</div>
            ) : (
              <ActivityTimeline 
                items={updates} 
                onOpenResumo={handleOpenResumo}
              />
            )}
          </section>
        </div>

        <aside className="animate-fade" style={{ animationDelay: '0.6s' }}>
          <TerminalPanel />
        </aside>
      </div>

      <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid hsla(var(--glass-border))', textAlign: 'center' }}>
        <p className="text-dim font-display" style={{ fontSize: '0.7rem', letterSpacing: '0.2em' }}>
          © 2026 Onyx Engine • Advanced Academic Monitoring
        </p>
      </footer>

      {selectedResumo && (
        <LessonDetailOverlay 
          item={selectedResumo} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default App;
