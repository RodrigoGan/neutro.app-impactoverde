-- Inserir conquistas padrão
INSERT INTO achievements (id, name, description, points_reward, category, icon, requirements) VALUES
('1', 'Primeira Coleta', 'Realizou sua primeira coleta', 10, 'coletas', 'Package', 'Realizar 1 coleta'),
('2', 'Coletor Ativo', 'Realizou 5 coletas', 25, 'coletas', 'Package', 'Realizar 5 coletas'),
('3', 'Reciclador Bronze', 'Reciclou 10kg de materiais', 15, 'reciclagem', 'Leaf', 'Reciclar 10kg'),
('4', 'Avaliador Ativo', 'Avaliou 5 coletas', 10, 'avaliacoes', 'Star', 'Avaliar 5 coletas'),
('5', 'Impacto Ambiental', 'Contribuiu para reduzir 50kg de CO2', 25, 'impacto', 'Trees', 'Reduzir 50kg de CO2'),
('6', 'Engajamento Comunitário', 'Participou de 3 eventos comunitários', 20, 'engajamento', 'Users', 'Participar de 3 eventos')
ON CONFLICT (id) DO NOTHING;

-- Inserir algumas conquistas para o usuário de teste
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES
('2863a918-7e01-42ec-95b4-35891c4321ee', '1', NOW()),
('2863a918-7e01-42ec-95b4-35891c4321ee', '2', NOW()),
('2863a918-7e01-42ec-95b4-35891c4321ee', '3', NOW())
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Atualizar progresso do usuário se não existir
INSERT INTO user_progress (user_id, total_points, collections_count, total_weight, current_level) VALUES
('2863a918-7e01-42ec-95b4-35891c4321ee', 50, 5, 25.5, 'silver')
ON CONFLICT (user_id) DO UPDATE SET
  total_points = EXCLUDED.total_points,
  collections_count = EXCLUDED.collections_count,
  total_weight = EXCLUDED.total_weight,
  current_level = EXCLUDED.current_level;

-- Inserir alguns usuários de teste para o ranking
INSERT INTO users (id, name, email, neighborhood, avatar_url) VALUES
('user-1', 'Ana Paula', 'ana@test.com', 'Centro', '👩'),
('user-2', 'Carlos Silva', 'carlos@test.com', 'Centro', '👨'),
('user-3', 'Marina Santos', 'marina@test.com', 'Centro', '👩'),
('user-4', 'Pedro Lima', 'pedro@test.com', 'Centro', '👨'),
('user-5', 'Julia Costa', 'julia@test.com', 'Centro', '👩')
ON CONFLICT (id) DO NOTHING;

-- Inserir progresso para os usuários de teste
INSERT INTO user_progress (user_id, total_points, collections_count, total_weight, current_level) VALUES
('user-1', 1250, 15, 120.5, 'gold'),
('user-2', 1100, 12, 95.2, 'gold'),
('user-3', 950, 10, 78.8, 'silver'),
('user-4', 800, 8, 65.3, 'silver'),
('user-5', 750, 6, 45.7, 'bronze')
ON CONFLICT (user_id) DO UPDATE SET
  total_points = EXCLUDED.total_points,
  collections_count = EXCLUDED.collections_count,
  total_weight = EXCLUDED.total_weight,
  current_level = EXCLUDED.current_level; 