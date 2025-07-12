import { supabase } from './supabaseClient';
import log from './logger';

// Tipos de ações auditáveis
export type AuditAction = 
  | 'user_login'
  | 'user_logout'
  | 'user_register'
  | 'user_update'
  | 'collection_create'
  | 'collection_update'
  | 'collection_delete'
  | 'coupon_create'
  | 'coupon_update'
  | 'coupon_delete'
  | 'points_add'
  | 'level_up'
  | 'level_down'
  | 'team_member_add'
  | 'team_member_remove'
  | 'settings_update'
  | 'permission_change'
  | 'data_export'
  | 'admin_action';

// Níveis de severidade
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

// Interface para log de auditoria
export interface AuditLog {
  id?: string;
  user_id: string;
  action: AuditAction;
  severity: AuditSeverity;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

/**
 * Registra uma ação de auditoria
 */
export async function logAuditEvent(
  userId: string,
  action: AuditAction,
  description: string,
  severity: AuditSeverity = 'low',
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const auditLog: AuditLog = {
      user_id: userId,
      action,
      severity,
      description,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };

    // Salvar no banco de dados
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditLog);

    if (error) {
      log.error('❌ [AuditLogger] Erro ao salvar log de auditoria:', error);
    } else {
      log.info('✅ [AuditLogger] Log de auditoria salvo:', {
        userId,
        action,
        severity,
        description
      });
    }

    // Log local para debugging
    log.info('📝 [AuditLogger] Evento de auditoria:', auditLog);

  } catch (error) {
    log.error('❌ [AuditLogger] Erro inesperado ao registrar auditoria:', error);
  }
}

/**
 * Registra tentativa de login
 */
export async function logLoginAttempt(
  userId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const action: AuditAction = success ? 'user_login' : 'user_login';
  const severity: AuditSeverity = success ? 'low' : 'medium';
  const description = success 
    ? 'Login realizado com sucesso'
    : 'Tentativa de login falhou';

  await logAuditEvent(userId, action, description, severity, {
    success,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}

/**
 * Registra criação de coleta
 */
export async function logCollectionCreation(
  userId: string,
  collectionId: string,
  materials: string[],
  quantity: number
): Promise<void> {
  await logAuditEvent(
    userId,
    'collection_create',
    'Nova coleta criada',
    'low',
    {
      collection_id: collectionId,
      materials,
      quantity
    }
  );
}

/**
 * Registra alteração de nível
 */
export async function logLevelChange(
  userId: string,
  oldLevel: string,
  newLevel: string,
  reason: string
): Promise<void> {
  const action: AuditAction = newLevel > oldLevel ? 'level_up' : 'level_down';
  const severity: AuditSeverity = 'medium';

  await logAuditEvent(
    userId,
    action,
    `Nível alterado de ${oldLevel} para ${newLevel}`,
    severity,
    {
      old_level: oldLevel,
      new_level: newLevel,
      reason
    }
  );
}

/**
 * Registra adição de pontos
 */
export async function logPointsAddition(
  userId: string,
  points: number,
  action: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent(
    userId,
    'points_add',
    `${points} pontos adicionados pela ação: ${action}`,
    'low',
    {
      points,
      action,
      ...metadata
    }
  );
}

/**
 * Registra ação administrativa
 */
export async function logAdminAction(
  adminUserId: string,
  targetUserId: string,
  action: string,
  details: string
): Promise<void> {
  await logAuditEvent(
    adminUserId,
    'admin_action',
    `Ação administrativa: ${action}`,
    'high',
    {
      target_user_id: targetUserId,
      action,
      details
    }
  );
}

/**
 * Registra alteração de permissões
 */
export async function logPermissionChange(
  adminUserId: string,
  targetUserId: string,
  oldPermissions: string[],
  newPermissions: string[]
): Promise<void> {
  await logAuditEvent(
    adminUserId,
    'permission_change',
    'Permissões de usuário alteradas',
    'high',
    {
      target_user_id: targetUserId,
      old_permissions: oldPermissions,
      new_permissions: newPermissions
    }
  );
}

/**
 * Registra exportação de dados
 */
export async function logDataExport(
  userId: string,
  dataType: string,
  recordCount: number
): Promise<void> {
  await logAuditEvent(
    userId,
    'data_export',
    `Exportação de ${recordCount} registros do tipo ${dataType}`,
    'medium',
    {
      data_type: dataType,
      record_count: recordCount
    }
  );
}

/**
 * Busca logs de auditoria de um usuário
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      log.error('❌ [AuditLogger] Erro ao buscar logs de auditoria:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    log.error('❌ [AuditLogger] Erro inesperado ao buscar logs:', error);
    return [];
  }
}

/**
 * Busca logs de auditoria por ação
 */
export async function getAuditLogsByAction(
  action: AuditAction,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      log.error('❌ [AuditLogger] Erro ao buscar logs por ação:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    log.error('❌ [AuditLogger] Erro inesperado ao buscar logs por ação:', error);
    return [];
  }
}

/**
 * Busca logs de auditoria por severidade
 */
export async function getAuditLogsBySeverity(
  severity: AuditSeverity,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('severity', severity)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      log.error('❌ [AuditLogger] Erro ao buscar logs por severidade:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    log.error('❌ [AuditLogger] Erro inesperado ao buscar logs por severidade:', error);
    return [];
  }
}

/**
 * Limpa logs antigos (manutenção)
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      log.error('❌ [AuditLogger] Erro ao limpar logs antigos:', error);
    } else {
      log.info('✅ [AuditLogger] Logs antigos limpos com sucesso');
    }
  } catch (error) {
    log.error('❌ [AuditLogger] Erro inesperado ao limpar logs:', error);
  }
} 