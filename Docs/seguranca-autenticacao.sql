-- =====================================================
-- SISTEMA DE SEGURANÇA E AUTENTICAÇÃO - NEUTRO IMPACTO VERDE
-- =====================================================

-- 1. TABELA DE LOGS DE AUDITORIA
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'user_login', 'user_logout', 'user_register', 'user_update',
    'collection_create', 'collection_update', 'collection_delete',
    'coupon_create', 'coupon_update', 'coupon_delete',
    'points_add', 'level_up', 'level_down',
    'team_member_add', 'team_member_remove',
    'settings_update', 'permission_change',
    'data_export', 'admin_action'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABELA DE TENTATIVAS DE LOGIN
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABELA DE TOKENS REVOGADOS
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- 4. TABELA DE SESSÕES ATIVAS
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- 5. TABELA DE PERMISSÕES DE USUÁRIO
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('read', 'write', 'delete', 'admin')),
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP,
  UNIQUE(user_id, resource, action)
);

-- 6. TABELA DE RATE LIMITING
CREATE TABLE IF NOT EXISTS rate_limit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  reset_time TIMESTAMP NOT NULL,
  blocked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(identifier, type)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Índices para login_attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);

-- Índices para revoked_tokens
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user_id ON revoked_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);

-- Índices para active_sessions
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires_at ON active_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_activity ON active_sessions(last_activity);

-- Índices para user_permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON user_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_user_permissions_expires_at ON user_permissions(expires_at);

-- Índices para rate_limit_entries
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_type ON rate_limit_entries(identifier, type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_reset_time ON rate_limit_entries(reset_time);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked_until ON rate_limit_entries(blocked_until);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para limpar logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar tentativas de login antigas
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM login_attempts 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar tokens revogados expirados
CREATE OR REPLACE FUNCTION cleanup_expired_revoked_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM revoked_tokens 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM active_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar permissões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_permissions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_permissions 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar rate limit expirado
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limit_entries 
  WHERE reset_time < NOW() AND (blocked_until IS NULL OR blocked_until < NOW());
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at em rate_limit_entries
CREATE OR REPLACE FUNCTION update_rate_limit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rate_limit_updated_at
  BEFORE UPDATE ON rate_limit_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limit_updated_at();

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- Políticas para audit_logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Políticas para login_attempts (apenas sistema pode inserir/visualizar)
CREATE POLICY "System can manage login attempts" ON login_attempts
  FOR ALL USING (true);

-- Políticas para revoked_tokens
CREATE POLICY "Users can view their own revoked tokens" ON revoked_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage revoked tokens" ON revoked_tokens
  FOR INSERT WITH CHECK (true);

-- Políticas para active_sessions
CREATE POLICY "Users can view their own active sessions" ON active_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage active sessions" ON active_sessions
  FOR ALL USING (true);

-- Políticas para user_permissions
CREATE POLICY "Users can view their own permissions" ON user_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Políticas para rate_limit_entries (apenas sistema)
CREATE POLICY "System can manage rate limits" ON rate_limit_entries
  FOR ALL USING (true);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para estatísticas de auditoria
CREATE OR REPLACE VIEW audit_stats AS
SELECT 
  action,
  severity,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30d
FROM audit_logs
GROUP BY action, severity
ORDER BY total_events DESC;

-- View para tentativas de login suspeitas
CREATE OR REPLACE VIEW suspicious_login_attempts AS
SELECT 
  email,
  ip_address,
  COUNT(*) as attempt_count,
  COUNT(*) FILTER (WHERE success = false) as failed_attempts,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt
FROM login_attempts
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY email, ip_address
HAVING COUNT(*) > 5 OR COUNT(*) FILTER (WHERE success = false) > 3
ORDER BY attempt_count DESC;

-- View para sessões ativas por usuário
CREATE OR REPLACE VIEW user_active_sessions AS
SELECT 
  u.email,
  u.name,
  u.user_type,
  COUNT(s.id) as active_sessions,
  MAX(s.last_activity) as last_activity,
  MAX(s.created_at) as session_start
FROM users u
LEFT JOIN active_sessions s ON u.id = s.user_id
WHERE s.expires_at > NOW()
GROUP BY u.id, u.email, u.name, u.user_type
ORDER BY active_sessions DESC;

-- =====================================================
-- JOBS DE MANUTENÇÃO (CRON)
-- =====================================================

-- Nota: Para usar jobs cron no Supabase, você precisa configurar
-- através do dashboard ou usar pg_cron se disponível

-- Exemplo de configuração manual:
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * 0', 'SELECT cleanup_old_audit_logs(90);');
-- SELECT cron.schedule('cleanup-login-attempts', '0 3 * * *', 'SELECT cleanup_old_login_attempts(30);');
-- SELECT cron.schedule('cleanup-expired-tokens', '0 4 * * *', 'SELECT cleanup_expired_revoked_tokens();');
-- SELECT cron.schedule('cleanup-expired-sessions', '*/15 * * * *', 'SELECT cleanup_expired_sessions();');
-- SELECT cron.schedule('cleanup-rate-limits', '*/5 * * * *', 'SELECT cleanup_expired_rate_limits();');

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir permissões padrão para admin
INSERT INTO user_permissions (user_id, resource, action, granted_at)
SELECT 
  u.id,
  '*',
  'admin',
  NOW()
FROM users u
WHERE u.user_type = 'admin'
ON CONFLICT (user_id, resource, action) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS EXPLICATIVOS
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Tabela para armazenar logs de auditoria de todas as ações importantes do sistema';
COMMENT ON TABLE login_attempts IS 'Tabela para rastrear tentativas de login para detecção de ataques';
COMMENT ON TABLE revoked_tokens IS 'Tabela para armazenar tokens revogados (logout, expiração)';
COMMENT ON TABLE active_sessions IS 'Tabela para rastrear sessões ativas dos usuários';
COMMENT ON TABLE user_permissions IS 'Tabela para gerenciar permissões granulares dos usuários';
COMMENT ON TABLE rate_limit_entries IS 'Tabela para implementar rate limiting no banco de dados';

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Remove logs de auditoria mais antigos que o número de dias especificado';
COMMENT ON FUNCTION cleanup_old_login_attempts IS 'Remove tentativas de login antigas para manter performance';
COMMENT ON FUNCTION cleanup_expired_revoked_tokens IS 'Remove tokens revogados expirados';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Remove sessões expiradas';
COMMENT ON FUNCTION cleanup_expired_permissions IS 'Remove permissões expiradas';
COMMENT ON FUNCTION cleanup_expired_rate_limits IS 'Remove entradas de rate limit expiradas';

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 