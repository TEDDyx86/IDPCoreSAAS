import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogIn, UserPlus, Mail, Lock, Sparkles, ShieldCheck } from 'lucide-react';
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
      <div className="glass login-card animate-reveal">
        <div className="login-header">
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
            <img 
              src={logo} 
              alt="IDP Core Logo" 
              style={{ 
                width: '180px', 
                height: 'auto',
                filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.08))'
              }} 
            />
          </div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'white' }}>
            IDP CORE
          </h1>
          <p className="font-display" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', fontWeight: 600 }}>
            ACADEMIC INTELLIGENCE GATEWAY
          </p>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '0 1.5rem',
              height: '64px',
              transition: 'all 0.4s ease'
            }} className="glass-hover">
              <Mail size={18} style={{ color: 'rgba(255,255,255,0.25)', marginRight: '1rem' }} />
              <input
                type="email"
                placeholder="ID Acadêmico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'Inter',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '0 1.5rem',
              height: '64px',
              transition: 'all 0.4s ease'
            }} className="glass-hover">
              <Lock size={18} style={{ color: 'rgba(255,255,255,0.25)', marginRight: '1rem' }} />
              <input
                type="password"
                placeholder="Chave de Acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'Inter',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {error && (
            <div className="animate-reveal" style={{ 
              padding: '1rem',
              background: 'rgba(255,68,68,0.08)',
              border: '1px solid rgba(255,68,68,0.15)',
              borderRadius: '14px',
              color: '#ff6666',
              fontSize: '0.8rem',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="premium-btn" style={{ 
            width: '100%', 
            height: '64px',
            fontSize: '1rem',
            fontWeight: 700,
            marginTop: '1rem'
          }} disabled={loading}>
            {loading ? 'SINCRONIZANDO...' : isRegistering ? 'CRIAR ACESSO' : 'ENTRAR'}
            {!loading && (isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />)}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem' }}>
          <button 
            type="button"
            className="nav-btn-text" 
            style={{ 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem', 
              fontWeight: 500, 
              opacity: 0.4,
              textDecoration: 'none',
              color: 'white'
            }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Já possui uma credencial?' : 'Solicitar Acesso Certificado'}
          </button>
        </div>

        <div style={{ 
          marginTop: '4.5rem', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '0.75rem', 
          opacity: 0.15 
        }}>
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
