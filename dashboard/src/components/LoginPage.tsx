import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogIn, UserPlus, Mail, Lock, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

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
          options: { emailRedirectTo: window.location.origin },
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
      <div className="login-card animate-reveal">
        <div className="login-header">
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Logo size={64} />
          </div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            IDP Core
          </h1>
          <p className="font-display text-ghost" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 600 }}>
            ACADEMIC INTELLIGENCE GATEWAY
          </p>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          <div>
            <div className="field-wrap">
              <Mail size={18} style={{ color: 'hsl(var(--ch-t2))', marginRight: '1rem', flexShrink: 0 }} />
              <input
                type="email"
                placeholder="ID Acadêmico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ background: 'none', border: 'none', color: 'hsl(var(--ch-t0))', fontSize: '1rem', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          <div>
            <div className="field-wrap">
              <Lock size={18} style={{ color: 'hsl(var(--ch-t2))', marginRight: '1rem', flexShrink: 0 }} />
              <input
                type="password"
                placeholder="Chave de Acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: 'none', border: 'none', color: 'hsl(var(--ch-t0))', fontSize: '1rem', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          {error && (
            <div
              className="animate-reveal"
              style={{
                padding: '1rem',
                background: 'hsla(var(--error), 0.08)',
                border: '1px solid hsla(var(--error), 0.15)',
                borderRadius: '14px',
                color: 'hsl(var(--error))',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="premium-btn"
            style={{ width: '100%', height: '64px', fontSize: '1rem', fontWeight: 700, marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'SINCRONIZANDO...' : isRegistering ? 'CRIAR ACESSO' : 'ENTRAR'}
            {!loading && (isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />)}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem' }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'hsl(var(--ch-t1))',
            }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Já possui uma credencial?' : 'Solicitar Acesso Certificado'}
          </button>
        </div>

        <div style={{ marginTop: '4.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', opacity: 0.15 }}>
          <ShieldCheck size={14} />
          <span className="font-display" style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.3em' }}>
            IDP CORE SECURITY
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
