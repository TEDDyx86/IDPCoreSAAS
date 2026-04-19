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


// Import Components
import StatusHeader from './components/StatusHeader';
import CourseCard from './components/CourseCard';
import ActivityTimeline from './components/ActivityTimeline';
import TerminalPanel from './components/TerminalPanel';
import LoginPage from './components/LoginPage';
import ConfigPage from './components/ConfigPage';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [updates, setUpdates] = useState<AcademicUpdate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedResumo, setSelectedResumo] = useState<AcademicUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user has configuration
  useEffect(() => {
    if (user) {
      const checkConfig = async () => {
        try {
          const { data, error } = await supabase
            .from('monitor_configs')
            .select('id')
            .maybeSingle();
          
          if (error) throw error;
          setHasConfig(!!data);
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

  const totalDisciplinas = Array.from(new Set(updates.map((u: AcademicUpdate) => u.disciplina))).length;

  return (
    <div className="dashboard-container">
      {error && <div className="status-alert error">{error}</div>}
      
      <header className="user-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginRight: 'auto' }}>
          <img src={logo} alt="Logo" style={{ height: '54px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(0,242,255,0.15))' }} />
          <div className="badge badge-cyan" style={{ gap: '0.5rem' }}>
             <Bell size={12} /> Live Scan Active
          </div>
        </div>
        <span className="text-dim" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{user.email}</span>
        <button className="nav-btn" onClick={() => setShowConfig(true)}>
          <SettingsIcon size={14} /> Config
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
            <h2>
              <LayoutGrid size={20} className="text-gradient" /> 
              Módulos Detectados
            </h2>
            <div className="grid-main">
              {Array.from(new Set(updates.map((u: AcademicUpdate) => u.disciplina))).map((nome: string, idx: number) => (
                <CourseCard 
                  key={idx}
                  nome={nome}
                  id={nome.toLowerCase().replace(/\s/g, '-')}
                />
              ))}
              {!loadingData && updates.length === 0 && (
                <div className="glass glass-card" style={{ textAlign: 'center' }}>
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
          © 2026 SEU MONITOR ACADÊMICO • SECURED INTELLIGENCE
        </p>
      </footer>

      {selectedResumo && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass glass-card animate-fade" onClick={e => e.stopPropagation()} style={{ background: 'hsl(var(--bg-onyx-soft))' }}>
            <button onClick={handleCloseModal} className="close-btn"><X size={24} /></button>
            <div className="modal-header" style={{ marginBottom: '2rem' }}>
              <span className="badge badge-purple" style={{ marginBottom: '1rem' }}>ANALYSIS_RECAP</span>
              <h2 style={{ fontSize: '2.5rem', lineHeight: '1' }}>{selectedResumo.titulo}</h2>
              <p className="text-dim font-display" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>{selectedResumo.disciplina}</p>
            </div>
            <div className="resumo-text" style={{ background: 'rgba(255,255,255,0.02)', borderLeftColor: 'hsl(var(--accent-purple))' }}>
              {selectedResumo.resumo}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleCloseModal} className="premium-btn">Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
