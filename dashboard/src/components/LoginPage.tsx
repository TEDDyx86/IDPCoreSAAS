import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogIn, UserPlus, Mail, Lock, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        alert('Cadastro realizado! Verifique sua caixa de entrada.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass animate-fade">
        <div className="login-header">
          <div className="pulse-animation" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                width: '180px', 
                height: 'auto',
                filter: 'drop-shadow(0 0 20px rgba(0,242,255,0.2))' 
              }} 
            />
          </div>
          <p className="text-dim font-display" style={{ fontSize: '0.8rem', letterSpacing: '0.3em' }}>
            Seu Monitor Acadêmico
          </p>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          <div className="input-group-stack">
            <label><Mail size={14} /> ID Acadêmico</label>
            <input
              type="email"
              placeholder="estudante@idp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group-stack">
            <label><Lock size={14} /> Chave de Acesso</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="status-alert error animate-fade" style={{ background: 'rgba(255,0,0,0.05)', borderRadius: 'var(--radius-xs)', marginBottom: '1.5rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem' }}>{error}</p>
            </div>
          )}

          <button type="submit" className="premium-btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Sincronizando...' : isRegistering ? 'Criar Acesso' : 'Autenticar'}
            {!loading && (isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />)}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '2.5rem' }}>
          <p className="text-dim" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>
            {isRegistering ? 'Já possui uma credencial?' : 'Novo por aqui?'}
          </p>
          <button 
            className="nav-btn" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Fazer Login' : 'Solicitar Acesso'}
          </button>
          
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
             <Sparkles size={12} className="text-gradient" />
             <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }} className="font-display">
               SECURED BY ENCRYPT_RLS
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
