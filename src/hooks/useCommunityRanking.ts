import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCommunityRanking(neighborhoodId?: string) {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!neighborhoodId) return;
    setLoading(true);
    supabase
      .from("community_ranking")
      .select("*")
      .eq("neighborhood_id", neighborhoodId)
      .order("total_points", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRanking(data || []);
        setLoading(false);
      });
  }, [neighborhoodId]);

  return { ranking, loading, error };
} 