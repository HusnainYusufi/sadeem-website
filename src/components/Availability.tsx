import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarX,
  Download,
  Info,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { useAvailabilityQuery } from "@/hooks/useAvailability";
import type { AvailabilityStatus } from "@/lib/supabase";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

const statusStyles: Record<AvailabilityStatus | "past", string> = {
  available: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  booked: "border-rose-500/50 bg-rose-500/15 text-rose-600",
  hold: "border-amber-500/50 bg-amber-500/15 text-amber-600",
  past: "border-border bg-muted text-muted-foreground",
};

const statusCopy: Record<AvailabilityStatus, string> = {
  available: "Open for booking",
  hold: "Soft hold",
  booked: "Locked",
};

const formatISO = (date: Date) => date.toISOString().split("T")[0];
const formatDisplay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

const Availability = () => {
  const { data: slots = [], isLoading, isFetching, refetch } = useAvailabilityQuery();
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus | "all">("all");

  useEffect(() => {
    if (slots.length && !selectedDate) {
      setSelectedDate(slots[0].date);
    }
  }, [slots, selectedDate]);

  const scheduleMap = useMemo(() => new Map(slots.map((slot) => [slot.date, slot])), [slots]);

  const filteredSlots = useMemo(
    () => (statusFilter === "all" ? slots : slots.filter((slot) => slot.status === statusFilter)),
    [slots, statusFilter],
  );

  const months = useMemo(() => {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return [first, next];
  }, [today]);

  const getStatusForDate = (date: Date): { status: AvailabilityStatus | "past"; label?: string; note?: string | null } => {
    const iso = formatISO(date);
    if (date < today) return { status: "past" };
    const scheduled = scheduleMap.get(iso);
    return scheduled ? { status: scheduled.status, label: scheduled.label, note: scheduled.note } : { status: "available" };
  };

  const selectedDetails = useMemo(() => {
    const iso = selectedDate || formatISO(today);
    const date = new Date(iso);
    const statusInfo = getStatusForDate(date);
    const formatted = date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    return { ...statusInfo, formatted };
  }, [selectedDate, scheduleMap, today]);

  const statusSummary = useMemo(() => {
    const summary = slots.reduce(
      (acc, slot) => {
        acc[slot.status] += 1;
        return acc;
      },
      { available: 0, hold: 0, booked: 0 } as Record<AvailabilityStatus, number>,
    );

    const nextOpen = slots.find((slot) => slot.status === "available" && new Date(slot.date) >= today);
    const nextHold = slots.find((slot) => slot.status === "hold" && new Date(slot.date) >= today);
    const nextLocked = slots.find((slot) => slot.status === "booked" && new Date(slot.date) >= today);

    return { summary, nextOpen, nextHold, nextLocked };
  }, [slots, today]);

  const upcomingHighlights = useMemo(
    () =>
      filteredSlots
        .filter((slot) => slot.status !== "available")
        .slice(0, 6)
        .map((slot) => ({
          ...slot,
          formatted: formatDisplay(slot.date),
        })),
    [filteredSlots],
  );

  const handleDownload = () => {
    const blob = new Blob([
      "Sunday Studio Availability (next 60 days)\n\n",
      ...slots.map((slot) => `${slot.date}: ${slot.status.toUpperCase()} — ${slot.label ?? statusCopy[slot.status]}${
        slot.note ? ` (${slot.note})` : ""
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

      const filteredOut = statusFilter !== "all" && status !== statusFilter && status !== "past";

      return (
        <button
          key={iso}
          type="button"
          onClick={() => setSelectedDate(iso)}
          className={`group flex flex-col items-start justify-between rounded-xl border px-3 py-2 text-left transition shadow-sm hover:-translate-y-0.5 hover:shadow-soft ${
            statusStyles[status]
          } ${selectedDate === iso ? "ring-2 ring-offset-2 ring-primary" : ""} ${filteredOut ? "opacity-40" : ""}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs uppercase tracking-[0.18em] text-foreground/60">{day}</span>
            {status === "booked" && <CalendarX className="h-4 w-4" />}
            {status === "hold" && <CalendarClock className="h-4 w-4" />}
            {status === "available" && <CalendarCheck className="h-4 w-4" />}
          </div>
          <div className="mt-1 text-xs text-foreground/80 leading-snug line-clamp-2">
            {status === "available" ? statusCopy.available : label}
          </div>
          {note && <p className="mt-1 text-[11px] text-foreground/60">{note}</p>}
        </button>
      );
    });

    return (
      <div key={monthDate.toISOString()} className="rounded-3xl border border-border bg-background/80 p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{monthDate.toLocaleString("default", { month: "long" })}</p>
            <p className="text-lg font-semibold">{monthDate.getFullYear()}</p>
          </div>
          <Badge variant="secondary" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Live board
          </Badge>
        </div>
        <div className="grid grid-cols-7 text-[11px] uppercase tracking-[0.2em] text-muted-foreground gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day} className="text-center">
              {day}
            </span>
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

  return (
    <section id="availability" className="py-16 lg:py-24 bg-muted/30">
      <div className="container px-6 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Studio calendar</p>
            <h2 className="font-display text-3xl md:text-4xl leading-tight">Interactive booking board with live holds</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Track every hold, lock dates with clients, and export a clean list for your inbox. Filter by status or jump to the
              next open day without losing the big-picture view.
            </p>
            <div className="flex flex-wrap gap-3 text-sm items-center">
              <div className="flex gap-2">
                {(["all", "available", "hold", "booked"] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={statusFilter === status ? "default" : "outline"}
                    onClick={() => setStatusFilter(status)}
                    className="gap-2"
                  >
                    {status === "available" && <CalendarCheck className="h-4 w-4" />}
                    {status === "hold" && <CalendarClock className="h-4 w-4" />}
                    {status === "booked" && <CalendarX className="h-4 w-4" />}
                    {status === "all" && <Sparkles className="h-4 w-4" />}
                    <span className="capitalize">{status === "all" ? "All" : status}</span>
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download dates
            </Button>
            <a
              href={`mailto:contact@sundaystudio.pk?subject=Hold%20a%20date&body=${encodeURIComponent(
                `Hi Sunday Studio, we'd like to reserve ${selectedDetails.formatted}.`,
              )}`}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-full uppercase tracking-[0.18em] text-xs flex items-center gap-2 shadow-soft"
            >
              Place a hold
            </a>
          </div>
        </div>

        <div className="grid xl:grid-cols-[2fr,1fr] gap-8 items-start">
          <div className="grid md:grid-cols-2 gap-6">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, index) => <Skeleton key={`skeleton-${index}`} className="h-[440px] rounded-3xl" />)
            ) : (
              months.map((month) => renderMonth(month))
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-6 space-y-4 border-primary/20 shadow-soft">
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
                <p className="mt-2 font-semibold text-foreground/90">{selectedDetails.label || "Open studio"}</p>
                <p className="text-sm text-foreground/70">
                  {selectedDetails.note ||
                    (selectedDetails.status === "available"
                      ? "Lock the day with a soft hold or confirm immediately."
                      : "Need this day? Call us — we can suggest adjacent slots.")}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                {([
                  {
                    label: "Available",
                    value: statusSummary.summary.available,
                    icon: <CalendarCheck className="h-4 w-4" />,
                  },
                  {
                    label: "On hold",
                    value: statusSummary.summary.hold,
                    icon: <CalendarClock className="h-4 w-4" />,
                  },
                  {
                    label: "Booked",
                    value: statusSummary.summary.booked,
                    icon: <CalendarX className="h-4 w-4" />,
                  },
                ] as const).map((item) => (
                  <Card key={item.label} className="p-3 border-dashed">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <span>{item.label}</span>
                      {item.icon}
                    </div>
                    <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                  </Card>
                ))}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {statusSummary.nextOpen && (
                  <p>
                    Next open slot: <span className="text-foreground font-semibold">{formatDisplay(statusSummary.nextOpen.date)}</span>
                  </p>
                )}
                {statusSummary.nextHold && (
                  <p>
                    Closest hold: <span className="text-foreground font-semibold">{formatDisplay(statusSummary.nextHold.date)}</span>
                  </p>
                )}
                {statusSummary.nextLocked && (
                  <p>
                    Locked date: <span className="text-foreground font-semibold">{formatDisplay(statusSummary.nextLocked.date)}</span>
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Holds & bookings</p>
                  <p className="font-semibold">All upcoming blocks</p>
                </div>
                <Badge variant="outline" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {upcomingHighlights.length || "--"}
                </Badge>
              </div>
              <ScrollArea className="h-64 pr-2">
                <div className="space-y-3">
                  {upcomingHighlights.length === 0 && <p className="text-sm text-muted-foreground">No holds or locks ahead.</p>}
                  {upcomingHighlights.map((slot) => (
                    <div key={slot.date} className="flex items-start gap-3 rounded-2xl border p-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${statusStyles[slot.status]}`}>
                        {slot.status === "booked" && <CalendarX className="h-4 w-4" />}
                        {slot.status === "hold" && <CalendarClock className="h-4 w-4" />}
                        {slot.status === "available" && <CalendarCheck className="h-4 w-4" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{slot.label ?? statusCopy[slot.status]}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{slot.formatted}</p>
                        {slot.note && <p className="text-sm text-foreground/70">{slot.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                Drag to scroll — this list updates as soon as you change availability inside the client portal.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Availability;
