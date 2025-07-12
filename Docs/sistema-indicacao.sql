-- =====================================================
-- SISTEMA DE INDICAÇÃO - NEUTRO IMPACTO VERDE
-- =====================================================

-- 1. Adicionar campos de referência na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS referral_created_at TIMESTAMP DEFAULT NOW();

-- 2. Criar tabela de indicações para tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  points_awarded BOOLEAN DEFAULT FALSE,
  points_awarded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(referred_id),
  UNIQUE(referrer_id, referred_id)
);

-- 3. Criar tabela de códigos de indicação para controle
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(user_id, code)
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- 5. Função para gerar código de indicação único
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Gerar código baseado no ID do usuário + timestamp + contador
    code := UPPER(SUBSTRING(MD5(user_id::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT || counter::TEXT) FROM 1 FOR 8));
    
    -- Verificar se o código já existe
    IF NOT EXISTS (SELECT 1 FROM referral_codes WHERE code = generate_referral_code.code) THEN
      RETURN code;
    END IF;
    
    counter := counter + 1;
    
    -- Evitar loop infinito
    IF counter > 100 THEN
      RAISE EXCEPTION 'Não foi possível gerar código único após 100 tentativas';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Função para processar indicação
CREATE OR REPLACE FUNCTION process_referral(
  p_referral_code TEXT,
  p_referred_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referrer_id UUID;
  v_code_exists BOOLEAN;
BEGIN
  -- Verificar se o código existe e está ativo
  SELECT user_id INTO v_referrer_id
  FROM referral_codes 
  WHERE code = p_referral_code 
    AND is_active = TRUE 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND usage_count < max_usage;
  
  IF v_referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se não é auto-indicação
  IF v_referrer_id = p_referred_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o usuário já foi indicado
  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = p_referred_user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Criar registro de indicação
  INSERT INTO referrals (referrer_id, referred_id, referral_code)
  VALUES (v_referrer_id, p_referred_user_id, p_referral_code);
  
  -- Atualizar usuário referenciado
  UPDATE users 
  SET referred_by = v_referrer_id,
      referral_code = p_referral_code,
      referral_created_at = NOW()
  WHERE id = p_referred_user_id;
  
  -- Incrementar contador de uso do código
  UPDATE referral_codes 
  SET usage_count = usage_count + 1
  WHERE code = p_referral_code;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para marcar indicação como completa
CREATE OR REPLACE FUNCTION complete_referral(p_referred_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_referral_id UUID;
  v_referrer_id UUID;
BEGIN
  -- Buscar indicação pendente
  SELECT id, referrer_id INTO v_referral_id, v_referrer_id
  FROM referrals 
  WHERE referred_id = p_referred_user_id 
    AND status = 'pending';
  
  IF v_referral_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Marcar como completa
  UPDATE referrals 
  SET status = 'completed',
      completed_at = NOW()
  WHERE id = v_referral_id;
  
  -- Aqui você pode adicionar lógica para dar pontos ao referenciador
  -- Por exemplo, chamar uma função que adiciona pontos
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para gerar código de indicação automaticamente
CREATE OR REPLACE FUNCTION create_referral_code_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Gerar código de indicação para novos usuários
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code(NEW.id);
    
    -- Inserir na tabela de códigos
    INSERT INTO referral_codes (user_id, code)
    VALUES (NEW.id, NEW.referral_code);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_create_referral_code ON users;
CREATE TRIGGER trigger_create_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_code_trigger();

-- 9. View para estatísticas de indicação
CREATE OR REPLACE VIEW referral_stats AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.referral_code,
  COUNT(r.id) as total_referrals,
  COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_referrals,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_referrals,
  rc.usage_count,
  rc.max_usage,
  u.created_at as user_created_at
FROM users u
LEFT JOIN referrals r ON u.id = r.referrer_id
LEFT JOIN referral_codes rc ON u.id = rc.user_id AND u.referral_code = rc.code
GROUP BY u.id, u.name, u.email, u.referral_code, rc.usage_count, rc.max_usage, u.created_at;

-- 10. Políticas RLS para segurança
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Política para referrals: usuário só pode ver suas próprias indicações
CREATE POLICY "Users can view their own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Política para referral_codes: usuário só pode ver seus próprios códigos
CREATE POLICY "Users can view their own referral codes" ON referral_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Política para inserção de referrals (apenas sistema)
CREATE POLICY "System can insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

-- Política para atualização de referrals (apenas sistema)
CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE USING (true);

-- Política para referral_codes (apenas sistema)
CREATE POLICY "System can manage referral codes" ON referral_codes
  FOR ALL USING (true);

-- 11. Comentários para documentação
COMMENT ON TABLE referrals IS 'Tabela para tracking de indicações entre usuários';
COMMENT ON TABLE referral_codes IS 'Tabela para controle de códigos de indicação';
COMMENT ON FUNCTION generate_referral_code IS 'Gera código único de indicação para usuário';
COMMENT ON FUNCTION process_referral IS 'Processa uma indicação usando código';
COMMENT ON FUNCTION complete_referral IS 'Marca indicação como completa';
COMMENT ON VIEW referral_stats IS 'View com estatísticas de indicação por usuário'; 