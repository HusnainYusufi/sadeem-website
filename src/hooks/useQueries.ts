import { useQuery } from "@tanstack/react-query";
import { ContactQuery, fetchQueriesFromSupabase, purgeSupabaseCache, readStoredSession } from "@/lib/supabase";

export const useQueries = () => {
  const session = readStoredSession();

  purgeSupabaseCache();

  return useQuery<ContactQuery[]>({
    queryKey: ["queries"],
    queryFn: async () => fetchQueriesFromSupabase(session?.access_token),
    enabled: Boolean(session),
    staleTime: 0,
  });
};
