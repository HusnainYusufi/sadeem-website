import { useMemo, useState } from "react";
import { CalendarCheck, CalendarClock, CalendarDays, CalendarX, Download, Info } from "lucide-react";

const statusStyles = {
  available: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  booked: "border-rose-500/50 bg-rose-500/15 text-rose-500",
  hold: "border-amber-500/50 bg-amber-500/15 text-amber-500",
  past: "border-border bg-muted text-muted-foreground",
};

type Status = "available" | "booked" | "hold" | "past";

type ScheduleEntry = {
  startOffset: number;
  endOffset?: number;
  status: Exclude<Status, "past">;
  label: string;
  note?: string;
};

const scheduleSeeds: ScheduleEntry[] = [
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

const formatISO = (date: Date) => date.toISOString().split("T")[0];

const Availability = () => {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const scheduleMap = useMemo(() => {
    const map = new Map<string, { status: Exclude<Status, "past">; label: string; note?: string }>();

    const addDay = (offset: number, status: Exclude<Status, "past">, label: string, note?: string) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      map.set(formatISO(date), { status, label, note });
    };

    scheduleSeeds.forEach((seed) => {
      const { startOffset, endOffset = startOffset, status, label, note } = seed;
      for (let i = startOffset; i <= endOffset; i += 1) {
        addDay(i, status, label, note);
      }
    });

    return map;
  }, [today]);

  const months = useMemo(() => {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return [first, next];
  }, [today]);

  const [selectedDate, setSelectedDate] = useState<string>(formatISO(today));

  const getStatusForDate = (date: Date): { status: Status; label?: string; note?: string } => {
    const iso = formatISO(date);
    if (date < today) return { status: "past" };
    const scheduled = scheduleMap.get(iso);
    return scheduled ? { status: scheduled.status, label: scheduled.label, note: scheduled.note } : { status: "available" };
  };

  const handleDownload = () => {
    const blob = new Blob([
      "Sunday Studio Availability (next 45 days)\n\n",
      ...Array.from(scheduleMap.entries()).map(([date, entry]) => `${date}: ${entry.status.toUpperCase()} — ${entry.label}${
        entry.note ? ` (${entry.note})` : ""
      }`),
    ]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sunday-studio-availability.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = Array.from({ length: startDay + daysInMonth }, (_, index) => {
      if (index < startDay) return null;
      const day = index - startDay + 1;
      const date = new Date(year, month, day);
      const iso = formatISO(date);
      const { status, label, note } = getStatusForDate(date);

      return (
        <button
          key={iso}
          type="button"
          onClick={() => setSelectedDate(iso)}
          className={`group flex flex-col items-start justify-between rounded-xl border px-3 py-2 text-left transition shadow-sm hover:-translate-y-0.5 hover:shadow-soft ${
            statusStyles[status]
          } ${selectedDate === iso ? "ring-2 ring-offset-2 ring-primary" : ""}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs uppercase tracking-[0.18em] text-foreground/60">{day}</span>
            {status === "booked" && <CalendarX className="h-4 w-4" />}
            {status === "hold" && <CalendarClock className="h-4 w-4" />}
            {status === "available" && <CalendarCheck className="h-4 w-4" />}
          </div>
          <div className="mt-1 text-xs text-foreground/80 leading-snug line-clamp-2">
            {status === "available" ? "Open for booking" : label}
          </div>
          {note && <p className="mt-1 text-[11px] text-foreground/60">{note}</p>}
        </button>
      );
    });

    return (
      <div key={monthDate.toISOString()} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{monthDate.toLocaleString("default", { month: "long" })}</p>
            <p className="text-sm text-muted-foreground">{monthDate.getFullYear()}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-muted text-xs flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Availability map
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startDay }, (_, index) => (
            <div key={`empty-${monthDate.toISOString()}-${index}`} className="h-20" />
          ))}
          {cells.filter(Boolean)}
        </div>
      </div>
    );
  };

  const selectedDetails = useMemo(() => {
    const date = new Date(selectedDate);
    const formatted = date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const statusInfo = getStatusForDate(date);
    return { formatted, ...statusInfo };
  }, [selectedDate]);

  const holdEmailBody = useMemo(
    () => encodeURIComponent(`Hi Sunday Studio, we'd like to reserve ${selectedDetails.formatted}.`),
    [selectedDetails.formatted],
  );

  return (
    <section id="availability" className="py-16 lg:py-24 bg-muted/30">
      <div className="container px-6 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Studio calendar</p>
            <h2 className="font-display text-3xl md:text-4xl leading-tight">See what's open, on hold, or locked</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Share this live board with clients so they know exactly which days are available. Holds keep a soft lock, booked
              days are firm, and everything else is ready to confirm.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 bg-emerald-500/10 text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 bg-amber-500/15 text-amber-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Hold
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 bg-rose-500/15 text-rose-600">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Booked
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 bg-muted text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/60" /> Past
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-3 border border-border rounded-full uppercase tracking-[0.18em] text-xs flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Download dates
            </button>
            <a
              href={`mailto:contact@sundaystudio.pk?subject=Hold%20a%20date&body=${holdEmailBody}`}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-full uppercase tracking-[0.18em] text-xs flex items-center gap-2"
            >
              Place a hold
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-8 items-start">
          <div className="grid md:grid-cols-2 gap-6">
            {months.map((month) => renderMonth(month))}
          </div>

          <div className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Selected day</p>
                <p className="text-lg font-semibold">{selectedDetails.formatted}</p>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${statusStyles[selectedDetails.status]}`}>
              <p className="text-xs uppercase tracking-[0.2em]">{selectedDetails.status}</p>
              <p className="mt-2 font-semibold text-foreground/90">
                {selectedDetails.label || "Open studio"}
              </p>
              <p className="text-sm text-foreground/70">
                {selectedDetails.note ||
                  (selectedDetails.status === "available"
                    ? "Lock the day with a soft hold or confirm immediately."
                    : "Need this day? Call us — we can suggest adjacent slots.")}
              </p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <CalendarCheck className="h-4 w-4 mt-0.5 text-emerald-500" />
                <p>Green days are fully open. We can commit holds instantly with a call or email.</p>
              </div>
              <div className="flex items-start gap-3">
                <CalendarClock className="h-4 w-4 mt-0.5 text-amber-500" />
                <p>Amber days are soft holds. They can convert to booked, so confirm quickly if you want them.</p>
              </div>
              <div className="flex items-start gap-3">
                <CalendarX className="h-4 w-4 mt-0.5 text-rose-500" />
                <p>Red days are locked. Tell us your flexibility and we'll propose adjacent availability.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Availability;
