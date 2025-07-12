-- =====================================================
-- ATUALIZAÇÃO DA TABELA COLLECTIONS - CAMPO OCCURRENCES
-- =====================================================

-- Adicionar campo occurrences para armazenar ocorrências de coletas recorrentes
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS occurrences JSONB DEFAULT '[]';

-- Adicionar comentário explicativo
COMMENT ON COLUMN collections.occurrences IS 'Array de ocorrências para coletas recorrentes. Cada ocorrência contém id, data, horario, status, materiais, observacao, fotos, avaliacao';

-- Criar índice para melhorar performance de consultas por ocorrências
CREATE INDEX IF NOT EXISTS idx_collections_occurrences ON collections USING GIN (occurrences);

-- Atualizar RLS (Row Level Security) se necessário
-- (Assumindo que já existe RLS na tabela collections)

-- Exemplo de estrutura esperada para o campo occurrences:
/*
[
  {
    "id": "oc-1",
    "data": "2024-03-15T00:00:00.000Z",
    "horario": "14:00",
    "status": "collected",
    "materiais": [
      {
        "type": "papel",
        "quantity": "10",
        "unit": "kg"
      }
    ],
    "observacao": "Coleta realizada com sucesso",
    "fotos": ["url1", "url2"],
    "avaliacao": {
      "estrelas": 5,
      "comentario": "Excelente serviço",
      "avaliadoPor": "solicitante"
    }
  }
]
*/ 