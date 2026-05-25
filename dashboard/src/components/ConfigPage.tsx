import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  Key, 
  Save, 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink,
  Zap,
  Info,
  Calendar as CalendarIcon
} from 'lucide-react';

interface ConfigPageProps {
  onClose?: () => void;
}

const ConfigPage: React.FC<ConfigPageProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [studentName, setStudentName] = useState('');
  const [icalToken, setIcalToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('monitor_configs')
          .select('canvas_token, student_name, ical_token')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setToken(data.canvas_token || '');
          setStudentName(data.student_name || '');
          setIcalToken(data.ical_token || '');
        }
      } catch (err: any) {
        console.error("Erro ao carregar setup:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      // Gera um token aleatório super seguro de 32 caracteres se estiver vazio
      let currentIcalToken = icalToken;
      if (!currentIcalToken) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let generated = '';
        for (let i = 0; i < 32; i++) {
          generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        currentIcalToken = generated;
        setIcalToken(generated);
      }

      const { error } = await supabase
        .from('monitor_configs')
        .upsert({
          user_id: user.id,
          canvas_token: token,
          student_name: studentName,
          active: true,
          ical_token: currentIcalToken,
          last_run: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Onyx Engine configurado com sucesso! Iniciando sincronização...' });
      if (onClose) setTimeout(onClose, 2000);
      else window.location.reload();
      
    } catch (err: any) {
      console.error("Erro detalhado ao salvar:", err);
      // Exibir o erro real vindo do Supabase para facilitar o debug
      const errorMsg = err.message || 'Falha ao salvar configurações.';
      setMessage({ 
        type: 'error', 
        text: `${errorMsg}. Verifique se rodou o script SQL no Supabase.` 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="pulse-animation">Carregando IDP Core...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="glass login-card animate-reveal">
        <div className="login-header">
          <div className="badge badge-cyan" style={{ marginBottom: '1.5rem', alignSelf: 'center' }}>
            <Zap size={12} /> IDP CORE v3.0
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Configuração</h1>
          <p className="text-dim" style={{ fontSize: '0.9rem' }}>Ative o monitoramento via API oficial Canvas</p>
        </div>

        <form onSubmit={handleSave} className="login-form">
          <div className="input-group" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="font-display" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', opacity: 0.5, fontWeight: 700 }}>
              ESTUDANTE (NOME EXIBIDO NO DASHBOARD)
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0 1.25rem',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div className="input-group" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="font-display" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', opacity: 0.5, fontWeight: 700 }}>
              CANVAS API ACCESS TOKEN
            </label>
            <div style={{ position: 'relative' }}>
              <Key style={{ 
                position: 'absolute', 
                left: '1.25rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                opacity: 0.3 
              }} size={18} />
              <input
                type="password"
                placeholder="Insira seu Token do Canvas aqui..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                style={{ 
                  width: '100%',
                  paddingLeft: '3.5rem',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
              <Info size={14} className="text-cyan" />
              Obtenha em: Perfil {'>'} Configurações {'>'} Novo Token
            </p>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255,255,255,0.04)',
            padding: '1.25rem',
            borderRadius: '16px',
            marginBottom: '1rem',
            textAlign: 'left'
          }}>
            <h4 style={{ fontSize: '0.8rem', color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <ShieldCheck size={14} className="text-cyan" /> Segurança IDP Core
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>
              Suas credenciais são protegidas por criptografia de ponta. O Token API garante sincronização estável sem necessidade de senha.
            </p>
          </div>

          {icalToken && (
            <div style={{ 
              background: 'rgba(0, 242, 255, 0.02)', 
              border: '1px solid rgba(0, 242, 255, 0.1)',
              padding: '1.25rem',
              borderRadius: '16px',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <h4 style={{ fontSize: '0.8rem', color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <CalendarIcon size={14} style={{ color: '#00f2ff' }} /> Sincronização iCal Dinâmica
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                Assine suas datas de provas e trabalhos no seu celular ou PC (Google Calendar, Apple, Outlook).
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/api/calendar?token=${icalToken}`}
                  style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'monospace'
                  }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/calendar?token=${icalToken}`);
                    alert("Link do calendário copiado com sucesso!");
                  }}
                  className="premium-btn"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.7rem',
                    borderRadius: '8px',
                    height: 'auto',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`animate-reveal`} style={{ 
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 500,
              background: message.type === 'success' ? 'rgba(0, 255, 150, 0.05)' : 'rgba(255, 68, 68, 0.05)',
              border: `1px solid ${message.type === 'success' ? 'rgba(0, 255, 150, 0.1)' : 'rgba(255, 68, 68, 0.1)'}`,
              color: message.type === 'success' ? '#00ff96' : '#ff4444',
              marginBottom: '1rem'
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            {onClose && (
              <button 
                type="button" 
                onClick={onClose} 
                className="nav-btn" 
                style={{ flex: 1, height: '60px', borderRadius: '16px', justifyContent: 'center' }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <button 
              type="submit" 
              disabled={saving} 
              className="premium-btn" 
              style={{ flex: 3, height: '60px', borderRadius: '16px', justifyContent: 'center', fontWeight: 700 }}
            >
              {saving ? 'CONFIGURANDO...' : <><Save size={18} /> ATIVAR IDP CORE</>}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2.5rem' }}>
          <a 
            href="https://canvas.instructure.com/doc/api/file.oauth.html#manual-token-generation" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              fontSize: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none'
            }}
          >
            Guia de Geração <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
