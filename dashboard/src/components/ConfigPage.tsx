import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, Key, Database, ChevronLeft, Save, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';

interface ConfigPageProps {
  onClose: () => void;
}

const ConfigPage: React.FC<ConfigPageProps> = ({ onClose }) => {
  const [matricula, setMatricula] = useState('');
  const [senhaIdp, setSenhaIdp] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      const { data } = await supabase.from('monitor_configs').select('*').maybeSingle();
      if (data) {
        setMatricula(data.student_id || '');
        setSenhaIdp(data.student_password || '');
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: existing } = await supabase.from('monitor_configs').select('id').maybeSingle();
      
      let error;
      if (existing) {
        ({ error } = await supabase.from('monitor_configs').update({ student_id: matricula, student_password: senhaIdp }).eq('id', existing.id));
      } else {
        ({ error } = await supabase.from('monitor_configs').insert({ student_id: matricula, student_password: senhaIdp }));
      }

      if (error) throw error;
      setMessage({ type: 'success', text: 'Configurações sincronizadas com sucesso.' });
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass glass-card animate-fade" style={{ maxWidth: '500px', textAlign: 'left' }}>
        <button onClick={onClose} className="nav-btn" style={{ marginBottom: '2rem' }}>
          <ChevronLeft size={16} /> Voltar ao Core
        </button>

        <div className="login-header" style={{ textAlign: 'left' }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ width: '120px', height: 'auto', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(0,242,255,0.15))' }} 
          />
          <h1 className="text-gradient">PROFILE_CONFIG</h1>
          <p className="text-dim font-display" style={{ fontSize: '0.75rem', letterSpacing: '0.2em' }}>Sincronização de Credenciais</p>
        </div>

        {loading ? (
          <div className="font-display text-dim" style={{ padding: '2rem 0' }}>DESCRIPTOGRAFANDO PERFIL...</div>
        ) : (
          <form onSubmit={handleSave} className="login-form">
            <div className="input-group-stack">
              <label><Database size={14} />Matrícula IDP</label>
              <input
                type="text"
                placeholder="211.xxxxx"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
              />
            </div>

            <div className="input-group-stack">
              <label><Key size={14} />Senha do Portal</label>
              <input
                type="password"
                placeholder="Sua senha IDP"
                value={senhaIdp}
                onChange={(e) => setSenhaIdp(e.target.value)}
                required
              />
              <p className="text-dim" style={{ fontSize: '0.65rem', marginTop: '0.5rem' }}>
                 Suas credenciais são transmitidas via túnel SSL e isoladas por RLS.
              </p>
            </div>

            {message && (
              <div className={`status-alert ${message.type} animate-fade`} style={{ marginTop: '1rem' }}>
                {message.text}
              </div>
            )}

            <button type="submit" className="premium-btn" style={{ width: '100%', marginTop: '2rem' }} disabled={saving}>
              {saving ? 'SINCRONIZANDO...' : 'SALVAR CREDENCIAIS'}
              {!saving && <Save size={18} />}
            </button>
          </form>
        )}

        <div style={{ marginTop: '3rem', borderTop: '1px solid hsla(var(--glass-border))', paddingTop: '1.5rem', display: 'flex', gap: '1rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
              <Shield size={14} />
              <span style={{ fontSize: '0.6rem', fontWeight: 700 }} className="font-display">RLS_STRICT_MODE</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
              <Sparkles size={14} />
              <span style={{ fontSize: '0.6rem', fontWeight: 700 }} className="font-display">ENCRYPT_DATA</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
