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


import AcademicCalendar, { type CalendarEvent } from './components/AcademicCalendar';
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
  
  // Calendar and Navigation Tabs States
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'calendar'>('feed');


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

  // Fetch updates and calendar events from Supabase
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

      const fetchCalendar = async () => {
        try {
          setLoadingCalendar(true);
          const { data, error } = await supabase
            .from('academic_calendar')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) throw error;
          if (data) setCalendarEvents(data);
        } catch (err: any) {
          console.error("Erro ao buscar calendário:", err);
        } finally {
          setLoadingCalendar(false);
        }
      };

      fetchUpdates();
      fetchCalendar();

      // Realtime subscription for academic updates
      const updatesSubscription = supabase
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

      // Realtime subscription for academic calendar
      const calendarSubscription = supabase
        .channel('academic_calendar_realtime')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'academic_calendar',
            filter: `user_id=eq.${user.id}` 
          }, () => {
          // Refetch calendar events to maintain ordering and data integrity
          fetchCalendar();
        })
        .subscribe();

      return () => {
        updatesSubscription.unsubscribe();
        calendarSubscription.unsubscribe();
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

      {/* ── Header ── */}
      <header
        className="user-nav animate-reveal"
        style={{ justifyContent: 'space-between', paddingTop: '0.5rem', paddingBottom: '0.5rem', marginBottom: '2.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src={logo} alt="IDP Core" style={{ height: '44px', width: 'auto' }} />
          <div className="badge badge-cyan" style={{ fontSize: '0.62rem', fontWeight: 700, gap: '0.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            IDP CORE ACTIVE
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p className="font-display" style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              {studentName || user.email?.split('@')[0]}
            </p>
            <p style={{ fontSize: '0.62rem', margin: 0, color: 'hsl(var(--ch-t2))' }}>Monitor Acadêmico</p>
          </div>
          <button className="nav-btn" onClick={() => setShowConfig(true)} aria-label="Configurações">
            <SettingsIcon size={16} />
          </button>
          <button className="nav-btn danger" onClick={signOut} aria-label="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Status ── */}
      <div className="animate-reveal" style={{ animationDelay: '0.08s' }}>
        <StatusHeader
          ultimaAtualizacao={lastRun || updates[0]?.data_detectado || 'Sincronizando...'}
          totalDisciplinas={totalDisciplinas}
          totalMateriais={updates.length}
        />
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '4rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem', minWidth: 0 }}>

          {/* Modules */}
          <section className="animate-reveal" style={{ animationDelay: '0.16s' }}>
            <div className="section-hd">
              <h2>
                Módulos
                <span className="section-count">({studentCourses.length || updates.length > 0 ? totalDisciplinas : 0})</span>
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="nav-btn" onClick={() => scroll('left')} aria-label="Anterior"><ChevronLeft size={17} /></button>
                <button className="nav-btn" onClick={() => scroll('right')} aria-label="Próximo"><ChevronRight size={17} /></button>
              </div>
            </div>

            <div className="carousel-wrapper">
              <div
                ref={sliderRef}
                className="carousel-container"
                style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '4px 0 12px', paddingRight: '100px' }}
              >
                {(studentCourses.length > 0
                  ? studentCourses
                  : Array.from(new Set(updates.map((u: AcademicUpdate) => u.disciplina))).map(n => ({ nome: n }))
                ).map((course: any, idx: number) => (
                  <div key={idx} style={{ minWidth: '300px', maxWidth: '340px', flex: '0 0 auto' }}>
                    <CourseCard
                      nome={course.nome || course.name}
                      id={String(course.id || idx)}
                      onClick={() => handleOpenCategory(course.nome || course.name)}
                    />
                  </div>
                ))}

                {!loadingData && updates.length === 0 && studentCourses.length === 0 && (
                  <div
                    style={{
                      minWidth: '320px',
                      padding: '3rem',
                      textAlign: 'center',
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      opacity: 0.5,
                    }}
                  >
                    <p className="font-display" style={{ fontSize: '0.95rem' }}>Aguardando sinais do portal acadêmico…</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Feed / Calendar */}
          <section className="animate-reveal" style={{ animationDelay: '0.24s' }}>
            <nav className="tab-nav">
              <button
                className={`tab-btn${activeTab === 'feed' ? ' active' : ''}`}
                onClick={() => setActiveTab('feed')}
              >
                Feed Acadêmico
              </button>
              <button
                className={`tab-btn${activeTab === 'calendar' ? ' active' : ''}`}
                onClick={() => setActiveTab('calendar')}
              >
                Calendário
              </button>
            </nav>

            {activeTab === 'feed' ? (
              loadingData ? (
                <div style={{ textAlign: 'center', padding: '6rem 0', color: 'hsl(var(--ch-t2))' }}>
                  <p className="font-display" style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                    Interceptando fluxos de dados…
                  </p>
                </div>
              ) : (
                <ActivityTimeline items={updates} onOpenResumo={handleOpenResumo} />
              )
            ) : (
              <AcademicCalendar events={calendarEvents} loading={loadingCalendar} />
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="animate-reveal" style={{ animationDelay: '0.32s' }}>
          <div style={{ position: 'sticky', top: '2rem' }}>
            <TerminalPanel events={calendarEvents} />
          </div>
        </aside>
      </div>

      <footer
        style={{
          marginTop: '8rem',
          padding: '4rem 0',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <img src={logo} alt="" style={{ height: '28px', opacity: 0.15, marginBottom: '1.5rem', filter: 'grayscale(1)' }} />
        <p style={{ fontSize: '0.65rem', opacity: 0.25, letterSpacing: '0.2em', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          IDP CORE V3.0 · ACADEMIC INTELLIGENCE MONITOR
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
