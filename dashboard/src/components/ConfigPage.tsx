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
  Info
} from 'lucide-react';

interface ConfigPageProps {
  onClose?: () => void;
}

const ConfigPage: React.FC<ConfigPageProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [token, setToken] = useState('');
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
          .select('canvas_token')
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setToken(data.canvas_token || '');
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
      console.log("Supabase: Salvando configuração no schema legado...");
      const { error } = await supabase
        .from('monitor_configs')
        .upsert({
          user_id: user.id,
          student_id: token, // Mapeamos o token para o campo student_id que já existe no seu banco
          active: true,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error("Supabase Error Details:", error);
        throw error;
      }
      
      setMessage({ type: 'success', text: 'Onyx Engine configurado com sucesso! Iniciando sincronização...' });
      if (onClose) setTimeout(onClose, 2000);
      else window.location.reload();
      
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setMessage({ type: 'error', text: 'Falha ao salvar configurações. Verifique sua conexão.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="pulse-animation">Carregando Onyx...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card glass animate-slide-up" style={{ maxWidth: '480px' }}>
        <div className="login-header">
          <div className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
            <Zap size={12} /> ONYX ENGINE v3.0
          </div>
          <h1>Configuração</h1>
          <p className="text-dim">Ative o monitoramento exclusivo via API oficial</p>
        </div>

        <form onSubmit={handleSave} className="login-form">
          <div className="input-group">
            <label className="font-display" style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.7 }}>
              CANVAS API ACCESS TOKEN
            </label>
            <div style={{ position: 'relative' }}>
              <Key className="input-icon" size={18} />
              <input
                type="password"
                placeholder="Insira seu Token do Canvas aqui..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="premium-input"
              />
            </div>
            <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={14} className="text-cyan" />
              Obtenha em: Perfil {'>'} Configurações {'>'} Novo Token de Acesso
            </p>
          </div>

          <div style={{ 
            background: 'rgba(0, 242, 255, 0.03)', 
            border: '1px solid hsla(var(--primary), 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontSize: '0.8rem', color: 'white', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={14} className="text-cyan" /> Segurança Onyx
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>
              Seu e-mail e senha não são mais necessários. O Token API oferece acesso mais rápido, seguro e sincronização instantânea de nome e conteúdos.
            </p>
          </div>

          {message && (
            <div className={`status-alert ${message.type}`} style={{ marginBottom: '1.5rem' }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            {onClose && (
              <button 
                type="button" 
                onClick={onClose} 
                className="nav-btn" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <ArrowLeft size={18} /> Voltar
              </button>
            )}
            <button 
              type="submit" 
              disabled={saving} 
              className="premium-btn" 
              style={{ flex: 2, justifyContent: 'center' }}
            >
              {saving ? 'Sincronizando...' : <><Save size={18} /> Ativar Onyx v3</>}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a 
            href="https://canvas.instructure.com/doc/api/file.oauth.html#manual-token-generation" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-link"
            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            Como gerar meu token? <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
