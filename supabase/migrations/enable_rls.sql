-- ============================================
-- BriefLoop - Habilitar RLS e Policies
-- Execute este arquivo no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/xtqvzfzmktggitqllsye/sqlEditor
-- ============================================

-- Habilitar Row Level Security nas tabelas
ALTER TABLE debriefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Policies: leitura pública para todos (MVP demo sem auth)
-- Escrita só via service role key (server-side)
CREATE POLICY "public_read_debriefings" ON debriefings FOR SELECT USING (true);
CREATE POLICY "public_read_briefs" ON briefs FOR SELECT USING (true);
CREATE POLICY "public_read_presets" ON presets FOR SELECT USING (true);

-- Verificar se ficou habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('debriefings', 'briefs', 'presets');
