import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Puxa chaves de ambiente do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bddficognlhukguelsle.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Habilita CORS simples para assinaturas externas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).send("Erro: Faltando token de autenticação do calendário iCal.");
    }

    // 1. Busca o user_id associado ao ical_token (Bypassa RLS usando o Service Role do backend)
    const { data: config, error: configError } = await supabase
      .from('monitor_configs')
      .select('user_id, student_name')
      .eq('ical_token', token)
      .maybeSingle();

    if (configError || !config) {
      return res.status(401).send("Erro: Token iCal inválido ou expirado.");
    }

    const { user_id, student_name } = config;

    // 2. Busca todos os eventos de calendário acadêmico salvos para este usuário
    const { data: events, error: eventsError } = await supabase
      .from('academic_calendar')
      .select('*')
      .eq('user_id', user_id);

    if (eventsError) {
      return res.status(500).send("Erro ao recuperar eventos acadêmicos do banco.");
    }

    // 3. Constrói a string do calendário no formato padrão internacional RFC 5545 (iCalendar)
    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Onyx Academic Mentor//IDP Core//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Calendário Acadêmico - ${student_name || 'IDP Core'}`,
      'X-WR-TIMEZONE:America/Sao_Paulo',
      'X-WR-CALDESC:Sincronização automática de provas e entregas de atividades extraídas pelo Onyx Engine.'
    ];

    if (events && events.length > 0) {
      events.forEach((event: any) => {
        // Limpa o formato YYYY-MM-DD para YYYYMMDD
        const dateClean = event.data_evento.replace(/-/g, '');
        
        // Identificador único persistente do evento
        const uid = `event-${event.id}@idpcore.onyx`;
        
        // Data de geração do timestamp RFC 5545
        const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        ical.push('BEGIN:VEVENT');
        ical.push(`UID:${uid}`);
        ical.push(`DTSTAMP:${dtstamp}`);
        ical.push(`DTSTART;VALUE=DATE:${dateClean}`);
        ical.push(`SUMMARY:[${event.disciplina.split('-')[0].trim()}] ${event.titulo}`);
        ical.push(`DESCRIPTION:${event.descricao || 'Compromisso acadêmico importado via IDP Core.'}`);
        ical.push(`CATEGORIES:${event.tipo}`);
        ical.push('END:VEVENT');
      });
    }

    ical.push('END:VCALENDAR');

    const icalContent = ical.join('\r\n');

    // 4. Configura cabeçalhos de resposta específicos para calendário iCal
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="calendario_academico.ics"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(200).send(icalContent);

  } catch (error: any) {
    console.error("Erro interno no calendar feed:", error);
    return res.status(500).send("Erro interno ao gerar feed do calendário.");
  }
}
