-- ===== SISTEMA DE PROTEÇÃO DE NÍVEL - NEUTRO IMPACTO VERDE =====

-- 1. Adicionar campos na tabela user_progress
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS level_achieved_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS protection_months_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_average_collections NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_average_kg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_average_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_notification_sent TIMESTAMP,
ADD COLUMN IF NOT EXISTS notification_type TEXT CHECK (notification_type IN ('protection', 'alert', 'drop'));

-- 2. Criar tabela level_notifications
CREATE TABLE IF NOT EXISTS level_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('protection', 'alert', 'drop')),
  message TEXT NOT NULL,
  action_required JSONB DEFAULT '{}',
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_level_notifications_user_id ON level_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_level_notifications_sent_at ON level_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_level_notifications_type ON level_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_user_progress_protection ON user_progress(protection_months_remaining);
CREATE INDEX IF NOT EXISTS idx_user_progress_level_date ON user_progress(level_achieved_date);

-- 4. Criar função para calcular média mensal
CREATE OR REPLACE FUNCTION calculate_monthly_average(
  p_user_id UUID,
  p_months INTEGER DEFAULT 3
) RETURNS TABLE (
  collections NUMERIC,
  kg NUMERIC,
  rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(collections_count), 0) as collections,
    COALESCE(AVG(kg_total), 0) as kg,
    COALESCE(AVG(rating_avg), 0) as rating
  FROM (
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) FILTER (WHERE action_key LIKE '%collection%' OR action_key LIKE '%coleta%') as collections_count,
      SUM(COALESCE((metadata->>'kg')::NUMERIC, 0)) as kg_total,
      AVG(COALESCE((metadata->>'rating')::NUMERIC, 0)) as rating_avg
    FROM points_log 
    WHERE user_id = p_user_id 
      AND created_at >= NOW() - INTERVAL '1 month' * p_months
    GROUP BY DATE_TRUNC('month', created_at)
  ) monthly_stats;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar função para avaliar nível do usuário
CREATE OR REPLACE FUNCTION evaluate_user_level(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_progress_record RECORD;
  monthly_averages RECORD;
  new_level TEXT;
  can_maintain BOOLEAN;
BEGIN
  -- Buscar progresso atual
  SELECT * INTO user_progress_record 
  FROM user_progress 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calcular médias mensais
  SELECT * INTO monthly_averages 
  FROM calculate_monthly_average(p_user_id, 3);
  
  -- Determinar nível baseado na média (simplificado)
  IF monthly_averages.collections >= 20 AND monthly_averages.kg >= 500 THEN
    new_level := 'gold';
  ELSIF monthly_averages.collections >= 10 AND monthly_averages.kg >= 200 THEN
    new_level := 'silver';
  ELSE
    new_level := 'bronze';
  END IF;
  
  -- Verificar se está em proteção
  IF user_progress_record.protection_months_remaining > 0 THEN
    -- Atualizar proteção
    UPDATE user_progress 
    SET 
      protection_months_remaining = protection_months_remaining - 1,
      monthly_average_collections = monthly_averages.collections,
      monthly_average_kg = monthly_averages.kg,
      monthly_average_rating = monthly_averages.rating
    WHERE user_id = p_user_id;
    
    -- Se proteção acabou, verificar se mantém nível
    IF user_progress_record.protection_months_remaining <= 1 THEN
      -- Verificar se pode manter o nível (70% dos requisitos)
      can_maintain := (
        monthly_averages.collections >= 7 AND 
        monthly_averages.kg >= 140
      );
      
      IF NOT can_maintain THEN
        -- Cair de nível
        UPDATE user_progress 
        SET 
          current_level = new_level,
          protection_months_remaining = 0,
          notification_type = 'drop',
          last_notification_sent = NOW()
        WHERE user_id = p_user_id;
        
        -- Inserir notificação de queda
        INSERT INTO level_notifications (user_id, notification_type, message, action_required)
        VALUES (
          p_user_id, 
          'drop', 
          'Você caiu de nível devido à baixa performance nos últimos meses.',
          jsonb_build_object(
            'type', 'drop',
            'currentLevel', user_progress_record.current_level,
            'newLevel', new_level
          )
        );
      ELSE
        -- Manteve o nível, resetar proteção
        UPDATE user_progress 
        SET 
          protection_months_remaining = 0,
          notification_type = NULL
        WHERE user_id = p_user_id;
      END IF;
    END IF;
  ELSE
    -- Não está em proteção, verificar se deve cair
    IF new_level != user_progress_record.current_level AND 
       (new_level = 'bronze' OR 
        (new_level = 'silver' AND user_progress_record.current_level = 'gold')) THEN
      
      -- Cair de nível
      UPDATE user_progress 
      SET 
        current_level = new_level,
        notification_type = 'drop',
        last_notification_sent = NOW()
      WHERE user_id = p_user_id;
      
      -- Inserir notificação de queda
      INSERT INTO level_notifications (user_id, notification_type, message, action_required)
      VALUES (
        p_user_id, 
        'drop', 
        'Você caiu de nível devido à baixa performance nos últimos meses.',
        jsonb_build_object(
          'type', 'drop',
          'currentLevel', user_progress_record.current_level,
          'newLevel', new_level
        )
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para ativar proteção quando subir de nível
CREATE OR REPLACE FUNCTION activate_level_protection()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o nível mudou para um nível maior
  IF NEW.current_level != OLD.current_level AND 
     (NEW.current_level = 'silver' OR NEW.current_level = 'gold') THEN
    
    -- Ativar proteção
    NEW.level_achieved_date := NOW();
    NEW.protection_months_remaining := 3;
    NEW.notification_type := 'protection';
    NEW.last_notification_sent := NOW();
    
    -- Inserir notificação de proteção
    INSERT INTO level_notifications (user_id, notification_type, message, action_required)
    VALUES (
      NEW.user_id, 
      'protection', 
      'Parabéns! Você subiu de nível e está protegido por 3 meses.',
      jsonb_build_object(
        'type', 'protection',
        'newLevel', NEW.current_level,
        'protectionMonths', 3
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_activate_level_protection ON user_progress;
CREATE TRIGGER trigger_activate_level_protection
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION activate_level_protection();

-- 7. Criar função para job mensal de avaliação
CREATE OR REPLACE FUNCTION monthly_level_evaluation()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Avaliar todos os usuários que têm proteção ativa ou que podem cair
  FOR user_record IN 
    SELECT user_id 
    FROM user_progress 
    WHERE protection_months_remaining > 0 
       OR current_level IN ('silver', 'gold')
  LOOP
    PERFORM evaluate_user_level(user_record.user_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. Comentários explicativos
COMMENT ON TABLE level_notifications IS 'Tabela para armazenar notificações do sistema de proteção de nível';
COMMENT ON COLUMN user_progress.level_achieved_date IS 'Data em que o usuário alcançou o nível atual';
COMMENT ON COLUMN user_progress.protection_months_remaining IS 'Meses restantes de proteção (0 = sem proteção)';
COMMENT ON COLUMN user_progress.monthly_average_collections IS 'Média de coletas dos últimos 3 meses';
COMMENT ON COLUMN user_progress.monthly_average_kg IS 'Média de kg dos últimos 3 meses';
COMMENT ON COLUMN user_progress.monthly_average_rating IS 'Média de avaliação dos últimos 3 meses';
COMMENT ON COLUMN user_progress.last_notification_sent IS 'Data da última notificação enviada';
COMMENT ON COLUMN user_progress.notification_type IS 'Tipo da última notificação (protection, alert, drop)';

-- 9. Políticas de segurança (RLS)
ALTER TABLE level_notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas notificações
CREATE POLICY "Users can view their own level notifications" ON level_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Política para inserção (apenas o sistema)
CREATE POLICY "System can insert level notifications" ON level_notifications
  FOR INSERT WITH CHECK (true);

-- Política para atualização (marcar como lida)
CREATE POLICY "Users can update their own level notifications" ON level_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Exemplo de uso
-- Para testar o sistema:
-- SELECT evaluate_user_level('user-uuid-here');
-- SELECT monthly_level_evaluation(); 