-- View para conquistas do usuário com detalhes
CREATE OR REPLACE VIEW user_achievements_with_details AS
SELECT 
  ua.id,
  ua.user_id,
  ua.achievement_id,
  ua.unlocked_at,
  a.name,
  a.description,
  a.points_reward,
  a.category,
  a.icon,
  a.requirements
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id;

-- View para ranking de usuários com progresso
CREATE OR REPLACE VIEW user_ranking_with_progress AS
SELECT 
  u.id,
  u.name,
  u.avatar_url,
  COALESCE(up.total_points, 0) as total_points,
  COALESCE(up.current_level, 'bronze') as current_level,
  COALESCE(up.collections_count, 0) as collections_count,
  COALESCE(up.total_weight, 0) as total_weight,
  u.created_at
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.deleted_at IS NULL
ORDER BY total_points DESC, collections_count DESC;

-- View para estatísticas de coletas por bairro
CREATE OR REPLACE VIEW neighborhood_collections_stats AS
SELECT 
  u.neighborhood,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(c.id) as total_collections,
  AVG(c.total_weight) as avg_weight_per_collection,
  SUM(c.total_weight) as total_weight
FROM users u
LEFT JOIN collections c ON u.id = c.solicitante_id
WHERE u.deleted_at IS NULL
GROUP BY u.neighborhood;

-- View para ranking de usuários por bairro
CREATE OR REPLACE VIEW neighborhood_user_ranking AS
SELECT 
  u.id,
  u.name,
  u.avatar_url,
  u.neighborhood,
  COALESCE(up.total_points, 0) as total_points,
  COALESCE(up.collections_count, 0) as collections_count,
  COALESCE(up.total_weight, 0) as total_weight,
  ROW_NUMBER() OVER (PARTITION BY u.neighborhood ORDER BY up.total_points DESC) as rank_in_neighborhood
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.deleted_at IS NULL; 