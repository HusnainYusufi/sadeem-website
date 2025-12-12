import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AvailabilitySlot,
  AvailabilityStatus,
  fetchAvailabilityFromSupabase,
  hasSupabaseConfig,
  readLocalAvailability,
  readStoredSession,
  upsertAvailabilityToSupabase,
  writeLocalAvailability,
} from "@/lib/supabase";

const formatISO = (date: Date) => date.toISOString().split("T")[0];

const buildAvailabilityWindow = (daysAhead: number): AvailabilitySlot[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: daysAhead }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const iso = formatISO(date);

    return {
      date: iso,
      status: "available",
      label: "Open studio",
    } satisfies AvailabilitySlot;
  });
};

export const AVAILABILITY_WINDOW_DAYS = 60;

export const useAvailabilityQuery = () => {
  const session = readStoredSession();
  const baseCalendar = buildAvailabilityWindow(AVAILABILITY_WINDOW_DAYS);

  const mergeWithBase = (overrides: AvailabilitySlot[]) => {
    if (!overrides.length) return baseCalendar;

    const map = new Map(baseCalendar.map((slot) => [slot.date, slot] as const));
    overrides.forEach((slot) => {
      const existing = map.get(slot.date) ?? {};
      map.set(slot.date, { ...existing, ...slot });
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  return useQuery<AvailabilitySlot[]>({
    queryKey: ["availability"],
    queryFn: async () => {
      const localOverrides = readLocalAvailability();
      const mergedLocal = mergeWithBase(localOverrides);

      if (!hasSupabaseConfig) {
        return mergedLocal;
      }

      try {
        const remote = await fetchAvailabilityFromSupabase(AVAILABILITY_WINDOW_DAYS, session?.access_token);
        const merged = mergeWithBase(remote.length ? remote : localOverrides);
        writeLocalAvailability(merged);
        return merged;
      } catch (error) {
        console.warn("Falling back to cached availability", error);
        return mergedLocal;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slot: AvailabilitySlot) => {
      const currentSession = readStoredSession();
      if (!hasSupabaseConfig) {
        throw new Error("Supabase credentials are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      }
      if (!currentSession?.access_token) {
        throw new Error("Please sign in to update availability.");
      }

      const payload: AvailabilitySlot = {
        ...slot,
        date: slot.date,
      };
      const result = await upsertAvailabilityToSupabase([payload], currentSession.access_token);
      return result[0] ?? payload;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
};
