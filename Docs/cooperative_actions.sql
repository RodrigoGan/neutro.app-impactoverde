-- Criação da tabela cooperative_actions
CREATE TABLE IF NOT EXISTS cooperative_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Pendente', 'Concluído', 'Cancelado')),
  cooperative_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cooperative_actions_cooperative_id ON cooperative_actions(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_actions_date ON cooperative_actions(date);
CREATE INDEX IF NOT EXISTS idx_cooperative_actions_status ON cooperative_actions(status);
CREATE INDEX IF NOT EXISTS idx_cooperative_actions_is_active ON cooperative_actions(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cooperative_actions_updated_at 
    BEFORE UPDATE ON cooperative_actions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (RLS)
ALTER TABLE cooperative_actions ENABLE ROW LEVEL SECURITY;

-- Política para cooperativas verem apenas suas ações
CREATE POLICY "Cooperativas podem ver suas próprias ações" ON cooperative_actions
  FOR SELECT USING (
    cooperative_id IN (
      SELECT e.id FROM entities e
      JOIN users u ON u.entity_id = e.id
      WHERE u.id = auth.uid() AND e.type = 'cooperative'
    )
  );

-- Política para cooperativas criarem ações
CREATE POLICY "Cooperativas podem criar ações" ON cooperative_actions
  FOR INSERT WITH CHECK (
    cooperative_id IN (
      SELECT e.id FROM entities e
      JOIN users u ON u.entity_id = e.id
      WHERE u.id = auth.uid() AND e.type = 'cooperative'
    )
  );

-- Política para cooperativas atualizarem suas ações
CREATE POLICY "Cooperativas podem atualizar suas ações" ON cooperative_actions
  FOR UPDATE USING (
    cooperative_id IN (
      SELECT e.id FROM entities e
      JOIN users u ON u.entity_id = e.id
      WHERE u.id = auth.uid() AND e.type = 'cooperative'
    )
  );

-- Política para cooperativas excluírem suas ações (soft delete)
CREATE POLICY "Cooperativas podem excluir suas ações" ON cooperative_actions
  FOR UPDATE USING (
    cooperative_id IN (
      SELECT e.id FROM entities e
      JOIN users u ON u.entity_id = e.id
      WHERE u.id = auth.uid() AND e.type = 'cooperative'
    )
  );

-- Inserir dados de exemplo (opcional)
INSERT INTO cooperative_actions (title, description, date, status, cooperative_id) VALUES
  ('Mutirão de Coleta no Bairro Central', 'Mutirão de coleta de materiais recicláveis no bairro central. Participação de todos os cooperados.', '2024-07-10', 'Agendado', (SELECT id FROM entities WHERE type = 'cooperative' LIMIT 1)),
  ('Reunião Mensal da Cooperativa', 'Reunião mensal para alinhamento de metas, distribuição de tarefas e discussão de melhorias.', '2024-07-15', 'Agendado', (SELECT id FROM entities WHERE type = 'cooperative' LIMIT 1)),
  ('Treinamento de Novos Cooperados', 'Treinamento sobre procedimentos de coleta, separação e classificação de materiais recicláveis.', '2024-07-20', 'Pendente', (SELECT id FROM entities WHERE type = 'cooperative' LIMIT 1))
ON CONFLICT DO NOTHING; 