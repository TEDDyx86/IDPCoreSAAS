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
import CategoryContentOverlay from './components/CategoryContentOverlay';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carousel State
  const [scrollPos, setScrollPos] = useState(0);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 400; // Fixed offset for reliability
      const { scrollLeft } = sliderRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
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
            .select('id, student_name, courses_list, last_run')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) throw error;
          setHasConfig(!!data);
          if (data?.student_name) setStudentName(data.student_name);
          if (data?.courses_list) setStudentCourses(data.courses_list);
          if (data?.last_run) setLastRun(data.last_run);
          
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
            .eq('user_id', user.id)
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
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'academic_updates',
            filter: `user_id=eq.${user.id}` 
          }, (payload) => {
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
  const handleOpenCategory = (name: string) => setSelectedCategory(name);
  const handleCloseCategory = () => setSelectedCategory(null);

  const totalDisciplinas = studentCourses.length || Array.from(new Set(updates.map((u: AcademicUpdate) => u.disciplina))).length;

  return (
    <div className="dashboard-container">
      <DisclaimerModal />
      {error && <div className="status-alert error">{error}</div>}
      
      <header className="user-nav animate-reveal" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src={logo} alt="IDP Core Logo" style={{ height: '48px', width: 'auto', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.05))' }} />
          <div className="badge badge-cyan" style={{ gap: '0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>
             <div className="pulse-animation" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
             IDP CORE ACTIVE
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p className="font-display" style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              {studentName || user.email?.split('@')[0]}
            </p>
            <p className="text-dim" style={{ fontSize: '0.65rem', margin: 0, opacity: 0.5 }}>Premium Academic Monitor</p>
          </div>
          
          <div className="nav-btn" onClick={() => setShowConfig(true)}>
            <SettingsIcon size={16} />
          </div>
          
          <button 
            className="nav-btn" 
            style={{ color: '#ff4444' }} 
            onClick={signOut}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="animate-reveal" style={{ animationDelay: '0.1s' }}>
        <StatusHeader 
          ultimaAtualizacao={lastRun || updates[0]?.data_detectado || 'Sincronizando...'}
          totalDisciplinas={totalDisciplinas}
          totalMateriais={updates.length}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '4rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', minWidth: 0 }}>
          <section className="animate-reveal" style={{ animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ margin: 0 }}>
                Módulos Detectados
                <span className="text-dim" style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: '0.5rem' }}>({studentCourses.length})</span>
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="nav-btn" onClick={() => scroll('left')} aria-label="Anterior"><ChevronLeft size={18} /></button>
                <button className="nav-btn" onClick={() => scroll('right')} aria-label="Próximo"><ChevronRight size={18} /></button>
              </div>
            </div>
            
            <div className="carousel-wrapper">
              <div 
                ref={sliderRef}
                className="carousel-container" 
                style={{ 
                  display: 'flex', 
                  gap: '2rem', 
                  overflowX: 'auto', 
                  padding: '0.5rem 0',
                  scrollBehavior: 'smooth',
                  paddingRight: '100px' // Added padding to compensate for mask
                }}
              >
                {(studentCourses.length > 0 ? studentCourses : Array.from(new Set(updates.map((u: AcademicUpdate) => u.disciplina))).map(n => ({nome: n}))).map((course: any, idx: number) => (
                  <div key={idx} style={{ minWidth: '360px' }}>
                    <CourseCard 
                      nome={course.nome || course.name}
                      id={String(course.id || idx)}
                      onClick={() => handleOpenCategory(course.nome || course.name)}
                    />
                  </div>
                ))}
                {!loadingData && updates.length === 0 && studentCourses.length === 0 && (
                  <div className="glass glass-card" style={{ width: '100%', padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                    <p className="font-display">Aguardando sinais do portal acadêmico...</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="animate-reveal" style={{ animationDelay: '0.3s' }}>
            <h2 style={{ marginBottom: '2.5rem' }}>
              Feed Acadêmico
            </h2>
            {loadingData ? (
              <div className="font-display text-dim" style={{ textAlign: 'center', padding: '6rem' }}>
                <div className="pulse-animation" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>☇</div>
                Interceptando fluxos de dados...
              </div>
            ) : (
              <ActivityTimeline 
                items={updates} 
                onOpenResumo={handleOpenResumo}
              />
            )}
          </section>
        </div>

        <aside className="animate-reveal" style={{ animationDelay: '0.4s' }}>
          <div style={{ position: 'sticky', top: '2rem' }}>
            <TerminalPanel />
          </div>
        </aside>
      </div>

      <footer style={{ marginTop: '8rem', padding: '5rem 0', borderTop: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
        <img src={logo} alt="Logo" style={{ height: '32px', width: 'auto', opacity: 0.2, marginBottom: '2rem', filter: 'grayscale(1)' }} />
        <p className="text-dim font-display" style={{ fontSize: '0.7rem', opacity: 0.3, letterSpacing: '0.2em', fontWeight: 600 }}>
          IDP CORE V3.0 • HIGH FIDELITY ACADEMIC MONITORING
        </p>
      </footer>

      {selectedResumo && (
        <LessonDetailOverlay 
          item={selectedResumo} 
          onClose={handleCloseModal} 
        />
      )}

      {selectedCategory && (
        <CategoryContentOverlay 
          disciplina={selectedCategory}
          items={updates.filter(u => u.disciplina === selectedCategory)}
          onClose={handleCloseCategory}
          onOpenResumo={handleOpenResumo}
        />
      )}
    </div>
  );
};

export default App;
