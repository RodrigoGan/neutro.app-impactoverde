import { supabase } from './supabaseClient';

// Salva os materiais aceitos pelo coletor
export async function saveCollectorMaterials(userId: string, materials: { material_id: string, description?: string }[]) {
  // Remove todos os materiais antigos do usuário
  await supabase.from('user_materials').delete().eq('user_id', userId);
  // Insere os novos materiais
  if (materials.length > 0) {
    console.log('DEBUG - Materiais a serem salvos:', materials);
    const { error } = await supabase.from('user_materials').insert(
      materials.map(m => ({ user_id: userId, material_id: m.material_id, description: m.description || null }))
    );
    if (error) throw error;
  }
}

// Busca os materiais aceitos pelo coletor
export async function getCollectorMaterials(userId: string) {
  const { data, error } = await supabase.from('user_materials').select('*').eq('user_id', userId);
  if (error) throw error;
  return data;
}

// Salva o veículo do coletor
export async function saveCollectorVehicle(userId: string, type: string, description?: string) {
  // Remove veículo antigo
  await supabase.from('vehicles').delete().eq('user_id', userId);
  // Insere novo veículo
  const { error } = await supabase.from('vehicles').insert({ user_id: userId, type, description: description || null });
  if (error) throw error;
}

// Busca o veículo do coletor
export async function getCollectorVehicle(userId: string) {
  const { data, error } = await supabase.from('vehicles').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

// Buscar dados de perfil do coletor
export async function getCollectorProfile(userId: string) {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

// Salvar dados de perfil do coletor
export async function saveCollectorProfile(userId: string, profile: { name: string, phone: string, document: string }) {
  console.log('DEBUG - Dados para inserir na tabela users:', {
    id: userId,
    name: profile.name,
    document: profile.document,
    phone: profile.phone,
    user_type: 'collector'
  });
  const { error } = await supabase.from('users').update(profile).eq('id', userId);
  if (error) throw error;
}

// Buscar endereço principal do coletor
export async function getCollectorAddress(userId: string) {
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).eq('is_main', true).single();
  if (error) throw error;
  return data;
}

// Salvar endereço principal do coletor
export async function saveCollectorAddress(userId: string, address: any) {
  // Atualiza o endereço principal existente
  const { data, error } = await supabase.from('addresses').update(address).eq('user_id', userId).eq('is_main', true);
  if (error) throw error;
  return data;
}

// Buscar bairros de atuação do coletor
export async function getCollectorNeighborhoods(userId: string) {
  const { data, error } = await supabase.from('user_neighborhoods').select('neighborhood_id').eq('user_id', userId);
  if (error) throw error;
  return data.map((n: any) => n.neighborhood_id);
}

// Salvar bairros de atuação do coletor
export async function saveCollectorNeighborhoods(userId: string, neighborhoodIds: string[]) {
  // Remove todos os bairros antigos
  await supabase.from('user_neighborhoods').delete().eq('user_id', userId);
  // Insere os novos bairros
  if (neighborhoodIds.length > 0) {
    await supabase.from('user_neighborhoods').insert(
      neighborhoodIds.map(id => ({ user_id: userId, neighborhood_id: id }))
    );
  }
}

// Buscar horários do coletor (agora retorna só 1 linha)
export async function getCollectorSchedules(userId: string) {
  const { data, error } = await supabase
    .from('collector_schedules')
    .select('*')
    .eq('collector_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

// Salvar horários do coletor (upsert: 1 linha por coletor)
export async function saveCollectorSchedules(
  userId: string,
  { days, periods, max_collections_per_day, interval_minutes }: {
    days: string[],
    periods: string[],
    max_collections_per_day: number,
    interval_minutes: number
  }
) {
  const { error } = await supabase.from('collector_schedules').upsert([{
    collector_id: userId,
    days,
    periods,
    max_collections_per_day,
    interval_minutes
  }], { onConflict: 'collector_id' });
  
  if (error) {
    console.error('Erro no upsert de horários:', error);
    throw error;
  }
  
  return { error: null };
}

// Busca todos os materiais padronizados do banco
export async function getAllMaterials() {
  const { data, error } = await supabase
    .from('materials_ordered')
    .select('id, nome, identificador, cor, icone, unidade');
  if (error) throw error;
  return data;
}

// Função para chamar a RPC get_or_create_city
export async function getOrCreateCity(name: string, state: string) {
  const { data, error } = await supabase.rpc('get_or_create_city', {
    p_name: name,
    p_state: state,
  });

  if (error) {
    console.error('Erro ao obter/criar cidade:', error);
    throw error;
  }
  return data;
}

// Função para chamar a RPC get_or_create_neighborhood
export async function getOrCreateNeighborhood(name: string, cityId: string) {
  const { data, error } = await supabase.rpc('get_or_create_neighborhood', {
    p_name: name,
    p_city_id: cityId,
  });

  if (error) {
    console.error('Erro ao obter/criar bairro:', error);
    throw error;
  }
  return data;
}

export async function getCollectorSchedule(collectorId: string) {
    const { data, error } = await supabase
        .from('collector_schedules')
        .select('*')
        .eq('collector_id', collectorId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching collector schedule:', error)
        throw error
    }

    return data
}

export async function upsertCollectorSchedule(schedule: {
    collector_id: string,
    days: string[],
    periods: string[],
    max_collections_per_day: number,
    interval_minutes: number
}) {
    const { data, error } = await supabase
        .from('collector_schedules')
        .upsert(schedule, { onConflict: 'collector_id' })
        .select()
        .single()

    if (error) {
        console.error('Error upserting collector schedule:', error)
        throw error
    }

    return data
}

export async function getCollectorCollections(collectorId: string) {
    const { data, error } = await supabase
        .from('collections')
        .select(`
            id,
            date,
            time,
            materials,
            quantity_description,
            observations,
            is_recurring,
            status,
            collection_type,
            collected_materials,
            mixed_quantity,
            rating
        `)
        .eq('collector_id', collectorId);

    if (error) {
        console.error('Error fetching collector collections:', error);
        throw error;
    }

    // TODO: Map the fetched data to the Coleta interface structure
    return data;
}

export async function getCollectorRecurringSchedules(collectorId: string) {
    const { data, error } = await supabase
        .from('recurring_schedules')
        .select(`
            id,
            status,
            frequency,
            weekdays,
            period,
            address,
            materials,
            solicitante:profiles (
                id,
                full_name,
                avatar_url,
                phone
            ),
            created_at,
            next_collection,
            refusal_reason,
            cancellation_reason
        `)
        .eq('collector_id', collectorId);

    if (error) {
        console.error('Error fetching collector recurring schedules:', error);
        throw error;
    }

    return data;
}

export async function searchNeighborhoods(query: string, cityId: string) {
  if (!query) return [];

  const { data, error } = await supabase
    .from('neighborhoods')
    .select('id, name')
    .eq('city_id', cityId)
    .ilike('name', `%${query}%`)
    .limit(10);

  if (error) {
    console.error('Erro ao buscar bairros:', error);
    throw error;
  }

  return data;
} 