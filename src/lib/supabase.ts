export type AvailabilityStatus = "available" | "booked" | "hold";

export type AvailabilitySlot = {
  id?: string | number;
  date: string; // ISO date string (YYYY-MM-DD)
  status: AvailabilityStatus;
  label?: string;
  note?: string | null;
};

export type ContactQuery = {
  id?: string | number;
  created_at?: string;
  name: string;
  email: string;
  phone: string;
  selected_package?: string;
  project_type?: string;
  preferred_date?: string;
  details?: string;
  other_services?: string[];
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const headers = (accessToken?: string) => ({
  apikey: SUPABASE_ANON_KEY ?? "",
  Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY || ""}`,
  "Content-Type": "application/json",
});

const handleResponse = async (response: Response) => {
  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(rawText || "Unable to reach Supabase");
  }

  if (!rawText) return null;

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error((error as Error).message || "Unable to parse response");
  }
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
};

const SESSION_STORAGE_KEY = "sunday-studio-session";
const QUERIES_STORAGE_KEY = "sunday-studio-queries";
const AVAILABILITY_STORAGE_KEY = "sunday-studio-availability";

export const purgeSupabaseCache = () => {
  if (!hasSupabaseConfig) return;
  try {
    localStorage.removeItem(QUERIES_STORAGE_KEY);
    localStorage.removeItem(AVAILABILITY_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to purge Supabase cache", error);
  }
};

export const readStoredSession = (): SupabaseSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SupabaseSession) : null;
  } catch (error) {
    console.error("Unable to read Supabase session", error);
    return null;
  }
};

export const writeSession = (session: SupabaseSession | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const readLocalQueries = (): ContactQuery[] => {
  try {
    const raw = localStorage.getItem(QUERIES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ContactQuery[]) : [];
  } catch (error) {
    console.error("Unable to read stored queries", error);
    return [];
  }
};

const writeLocalQueries = (queries: ContactQuery[]) => {
  localStorage.setItem(QUERIES_STORAGE_KEY, JSON.stringify(queries));
};

export const readLocalAvailability = (): AvailabilitySlot[] => {
  try {
    const raw = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AvailabilitySlot[]) : [];
  } catch (error) {
    console.error("Unable to read stored availability", error);
    return [];
  }
};

export const writeLocalAvailability = (slots: AvailabilitySlot[]) => {
  localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(slots));
};

const mergeAvailabilitySlots = (base: AvailabilitySlot[], overrides: AvailabilitySlot[]) => {
  const map = new Map(base.map((slot) => [slot.date, slot] as const));

  overrides.forEach((slot) => {
    const existing = map.get(slot.date) ?? {};
    map.set(slot.date, { ...existing, ...slot });
  });

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};

export const signInWithSupabase = async (email: string, password: string): Promise<SupabaseSession> => {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(response);
  const session: SupabaseSession = {
    access_token: data?.access_token,
    refresh_token: data?.refresh_token,
    expires_in: data?.expires_in,
    expires_at: data?.expires_at,
    token_type: data?.token_type,
  };
  writeSession(session);
  return session;
};

export const signOutFromSupabase = async () => {
  const session = readStoredSession();
  writeSession(null);

  if (!hasSupabaseConfig || !session?.access_token) return;

  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: headers(session.access_token),
  });
};

export const fetchAvailabilityFromSupabase = async (
  daysAhead: number,
  accessToken?: string,
): Promise<AvailabilitySlot[]> => {
  if (!hasSupabaseConfig) return readLocalAvailability();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + daysAhead);

  const query = new URL(`${SUPABASE_URL}/rest/v1/availability_slots`);
  query.searchParams.set("select", "*");
  query.searchParams.set("order", "date.asc");
  query.searchParams.append("date", `gte.${today.toISOString().split("T")[0]}`);
  query.searchParams.append("date", `lte.${futureDate.toISOString().split("T")[0]}`);

  const response = await fetch(query.toString(), {
    headers: {
      ...headers(accessToken),
      Prefer: "count=none",
    },
  });

  const data = await handleResponse(response);
  const slots = (data as AvailabilitySlot[]).map((slot) => ({
    ...slot,
    note: slot.note ?? null,
  }));

  return slots;
};

export const upsertAvailabilityToSupabase = async (
  payload: AvailabilitySlot[],
  accessToken?: string,
): Promise<AvailabilitySlot[]> => {
  const saveLocally = () => {
    const merged = mergeAvailabilitySlots(readLocalAvailability(), payload);
    writeLocalAvailability(merged);
    return merged.filter((slot) => payload.some((entry) => entry.date === slot.date));
  };

  if (!hasSupabaseConfig) {
    return saveLocally();
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/availability_slots?on_conflict=date`, {
    method: "POST",
    headers: {
      ...headers(accessToken),
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(
      payload.map((slot) => ({
        ...slot,
        note: slot.note ?? null,
      })),
    ),
  });

  const data = await handleResponse(response);
  const saved = (data as AvailabilitySlot[]) ?? [];
  return saved;
};

export const submitQueryToSupabase = async (payload: ContactQuery): Promise<ContactQuery> => {
  const localFallback = () => {
    const existing = readLocalQueries();
    const entry: ContactQuery = {
      ...payload,
      id: payload.id ?? crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    writeLocalQueries([entry, ...existing]);
    return entry;
  };

  if (!hasSupabaseConfig) {
    return localFallback();
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/queries`, {
    method: "POST",
    headers: {
      ...headers(),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      selected_package: payload.selected_package ?? null,
      project_type: payload.project_type ?? null,
      preferred_date: payload.preferred_date ?? null,
      details: payload.details ?? null,
      other_services: payload.other_services ?? [],
    }),
  });

  const data = await handleResponse(response);
  const saved = (data as ContactQuery[])[0];
  return saved ?? localFallback();
};

export const fetchQueriesFromSupabase = async (accessToken?: string): Promise<ContactQuery[]> => {
  if (!hasSupabaseConfig) {
    return readLocalQueries();
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/queries?select=*&order=created_at.desc`, {
    headers: headers(accessToken),
  });

  const data = await handleResponse(response);
  const results = (data as ContactQuery[]).map((entry) => ({
    ...entry,
    other_services: entry.other_services ?? [],
  }));

  return results;
};
