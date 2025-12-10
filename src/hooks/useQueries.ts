import { useQuery } from "@tanstack/react-query";
import { ContactQuery, fetchQueriesFromSupabase, readStoredSession } from "@/lib/supabase";

export const useQueries = () => {
  const session = readStoredSession();

  return useQuery<ContactQuery[]>({
    queryKey: ["queries"],
    queryFn: async () => fetchQueriesFromSupabase(session?.access_token),
    enabled: Boolean(session),
    staleTime: 1000 * 60 * 5,
  });
};
