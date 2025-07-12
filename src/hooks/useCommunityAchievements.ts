import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCommunityAchievements(neighborhoodId?: string) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!neighborhoodId) return;
    setLoading(true);
    supabase
      .from("community_achievements")
      .select("*, achievements(name, description, icon)")
      .eq("neighborhood_id", neighborhoodId)
      .order("unlocked_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setAchievements(data || []);
        setLoading(false);
      });
  }, [neighborhoodId]);

  return { achievements, loading, error };
} 