export type AvailabilityStatus = "available" | "booked" | "hold";

export type AvailabilitySlot = {
  id?: string | number;
  date: string; // ISO date string (YYYY-MM-DD)
  status: AvailabilityStatus;
  label?: string;
  note?: string | null;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const headers = (accessToken?: string) => ({
  apikey: SUPABASE_ANON_KEY ?? "",
  Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY || ""}`,
  "Content-Type": "application/json",
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to reach Supabase");
  }
  return response.json();
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
};

const SESSION_STORAGE_KEY = "sunday-studio-session";

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
  if (!hasSupabaseConfig) return [];
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
  return (data as AvailabilitySlot[]).map((slot) => ({
    ...slot,
    note: slot.note ?? null,
  }));
};

export const upsertAvailabilityToSupabase = async (
  payload: AvailabilitySlot[],
  accessToken?: string,
): Promise<AvailabilitySlot[]> => {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase environment variables are missing.");
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
  return data as AvailabilitySlot[];
};
