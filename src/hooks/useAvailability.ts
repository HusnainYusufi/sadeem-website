import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AvailabilitySlot,
  AvailabilityStatus,
  fetchAvailabilityFromSupabase,
  readLocalAvailability,
  readStoredSession,
  upsertAvailabilityToSupabase,
  writeLocalAvailability,
} from "@/lib/supabase";

const formatISO = (date: Date) => date.toISOString().split("T")[0];

const scheduleSeeds: {
  startOffset: number;
  endOffset?: number;
  status: Exclude<AvailabilityStatus, "available">;
  label: string;
  note?: string;
}[] = [
  { startOffset: 1, status: "booked", label: "TVC full-day block" },
  { startOffset: 3, endOffset: 4, status: "hold", label: "Fashion rehearsal buffer" },
  { startOffset: 7, status: "booked", label: "Music video — confirmed" },
  { startOffset: 10, endOffset: 12, status: "booked", label: "Bridal lookbook" },
  { startOffset: 16, status: "hold", label: "Agency walkthrough", note: "Pending PO" },
  { startOffset: 19, endOffset: 20, status: "booked", label: "Product launch films" },
  { startOffset: 25, status: "hold", label: "Fashion BTS" },
  { startOffset: 32, endOffset: 34, status: "booked", label: "Set build & strike" },
  { startOffset: 40, status: "hold", label: "Open for half-day", note: "AM only" },
];

const buildSeededCalendar = (daysAhead: number): AvailabilitySlot[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const map = new Map<string, AvailabilitySlot>();

  const addDay = (offset: number, status: Exclude<AvailabilityStatus, "available">, label: string, note?: string) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const iso = formatISO(date);
    map.set(iso, { date: iso, status, label, note });
  };

  scheduleSeeds.forEach(({ startOffset, endOffset = startOffset, status, label, note }) => {
    for (let i = startOffset; i <= endOffset; i += 1) {
      addDay(i, status, label, note);
    }
  });

  return Array.from({ length: daysAhead }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const iso = formatISO(date);
    const scheduled = map.get(iso);
    return (
      scheduled ?? {
        date: iso,
        status: "available",
        label: "Open studio",
      }
    );
  });
};

export const AVAILABILITY_WINDOW_DAYS = 60;

export const useAvailabilityQuery = () => {
  const session = readStoredSession();

  return useQuery<AvailabilitySlot[]>({
    queryKey: ["availability"],
    queryFn: async () => {
      const seeded = buildSeededCalendar(AVAILABILITY_WINDOW_DAYS);
      const mergeWithLocal = (source: AvailabilitySlot[]) => {
        const overrides = readLocalAvailability();
        if (!overrides.length) return source;

        const map = new Map(source.map((slot) => [slot.date, slot] as const));
        overrides.forEach((slot) => {
          const existing = map.get(slot.date) ?? {};
          map.set(slot.date, { ...existing, ...slot });
        });
        return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
      };

      try {
        const remote = await fetchAvailabilityFromSupabase(AVAILABILITY_WINDOW_DAYS, session?.access_token);
        const merged = mergeWithLocal(remote.length ? remote : seeded);
        writeLocalAvailability(merged);
        return merged;
      } catch (error) {
        console.warn("Falling back to seeded availability", error);
        const merged = mergeWithLocal(seeded);
        return merged.length ? merged : seeded;
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
      const payload: AvailabilitySlot = {
        ...slot,
        date: slot.date,
      };
      const result = await upsertAvailabilityToSupabase([payload], currentSession?.access_token);
      return result[0] ?? payload;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
};
