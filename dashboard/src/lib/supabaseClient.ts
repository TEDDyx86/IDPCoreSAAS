import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Renders a visible diagnostic screen (instead of a blank page) when the
 * Supabase env vars did not reach this build. Vite inlines `import.meta.env.VITE_*`
 * at BUILD time, so a missing value here means the build that produced this
 * bundle never received it — even if it is configured in Vercel for another
 * environment/scope.
 */
function renderEnvDiagnostic() {
  const root = document.getElementById('root');
  if (!root) return;

  const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

  const row = (name: string, value: string | undefined, opts: { secret?: boolean } = {}) => {
    const ok = !!value;
    const display = ok ? (opts.secret ? 'definida (valor oculto)' : esc(value as string)) : 'AUSENTE';
    return `
      <li style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;
                 border:1px solid ${ok ? 'rgba(21,128,61,.28)' : 'rgba(220,38,38,.32)'};
                 background:${ok ? 'rgba(22,163,74,.08)' : 'rgba(220,38,38,.07)'};">
        <span style="font-size:16px;line-height:1;">${ok ? '✅' : '❌'}</span>
        <code style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:600;font-size:13px;color:#0F172A;">${name}</code>
        <span style="margin-left:auto;font-size:12px;font-weight:600;max-width:48%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
                     color:${ok ? '#15803D' : '#DC2626'};">${display}</span>
      </li>`;
  };

  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;
                background:#F8FAFC;color:#0F172A;
                font-family:'Plus Jakarta Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="width:100%;max-width:520px;background:#fff;border:1px solid rgba(15,23,42,.08);
                  border-radius:24px;padding:40px;box-shadow:0 12px 32px -14px rgba(15,23,42,.2);">
        <div style="width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;
                    background:rgba(79,70,229,.1);color:#4F46E5;font-size:24px;margin-bottom:20px;">⚙︎</div>
        <h1 style="font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 8px;">Configuração incompleta</h1>
        <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 24px;">
          As variáveis de ambiente do Supabase não chegaram a este <em>build</em>. O Vite fixa os valores
          <code style="font-family:ui-monospace,monospace;font-size:12px;">VITE_*</code> no momento da compilação —
          então o build precisa ser refeito <b>depois</b> de configurá-las.
        </p>
        <ul style="list-style:none;margin:0 0 24px;padding:0;display:flex;flex-direction:column;gap:10px;">
          ${row('VITE_SUPABASE_URL', supabaseUrl)}
          ${row('VITE_SUPABASE_ANON_KEY', supabaseAnonKey, { secret: true })}
        </ul>
        <div style="background:#F1F5F9;border-radius:14px;padding:18px 20px;font-size:13px;line-height:1.7;color:#334155;">
          <b style="color:#0F172A;">Como corrigir</b>
          <ol style="margin:8px 0 0;padding-left:18px;">
            <li>Nomes exatos com prefixo <code style="font-family:ui-monospace,monospace;">VITE_</code> (não confundir com <code style="font-family:ui-monospace,monospace;">SUPABASE_*</code> da função <code style="font-family:ui-monospace,monospace;">/api</code>).</li>
            <li>No Vercel, marque o escopo <b>Preview</b> (além de Production).</li>
            <li>Faça <b>Redeploy</b> sem cache de build (env só vale em build novo).</li>
            <li>Local: crie <code style="font-family:ui-monospace,monospace;">dashboard/.env.local</code> e rode <code style="font-family:ui-monospace,monospace;">npm run dev</code>.</li>
          </ol>
        </div>
      </div>
    </div>`;
}

if (!supabaseUrl || !supabaseAnonKey) {
  renderEnvDiagnostic();
  throw new Error(
    `[IDP Core] Variáveis de ambiente ausentes neste build: ` +
      [
        !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
        !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
      ]
        .filter(Boolean)
        .join(', '),
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
