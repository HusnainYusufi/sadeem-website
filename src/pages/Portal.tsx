import { useMemo, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarX,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { useAvailabilityMutation, useAvailabilityQuery } from "@/hooks/useAvailability";
import {
  AvailabilityStatus,
  hasSupabaseConfig,
  readStoredSession,
  signInWithSupabase,
  signOutFromSupabase,
} from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const formatISO = (date: Date) => date.toISOString().split("T")[0];

const statusBadge = (status: AvailabilityStatus) => {
  switch (status) {
    case "available":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/40 gap-1">
          <CalendarCheck className="h-4 w-4" /> Available
        </Badge>
      );
    case "hold":
      return (
        <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/40 gap-1">
          <CalendarClock className="h-4 w-4" /> Hold
        </Badge>
      );
    default:
      return (
        <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/40 gap-1">
          <CalendarX className="h-4 w-4" /> Booked
        </Badge>
      );
  }
};

const Portal = () => {
  const todayISO = useMemo(() => formatISO(new Date()), []);
  const { data: slots = [], isLoading, refetch } = useAvailabilityQuery();
  const { toast } = useToast();
  const mutation = useAvailabilityMutation();
  const [session, setSession] = useState(readStoredSession());
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    date: todayISO,
    status: "available" as AvailabilityStatus,
    label: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upcoming = useMemo(() => slots.slice(0, 12), [slots]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const nextSession = await signInWithSupabase(credentials.email, credentials.password);
      setSession(nextSession);
      setAuthError(null);
      toast({ title: "Logged in", description: "Session stored for the portal." });
      await refetch();
    } catch (error) {
      setAuthError((error as Error).message);
      toast({ title: "Login failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOutFromSupabase();
    setSession(null);
    toast({ title: "Signed out" });
  };

  const handleSlotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync({
        date: formState.date,
        status: formState.status,
        label: formState.label || undefined,
        note: formState.note || null,
      });
      toast({ title: "Saved", description: "Availability updated for the selected date." });
      await refetch();
    } catch (error) {
      toast({
        title: "Could not save",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const prefillFromSlot = (slotDate: string) => {
    const slot = slots.find((entry) => entry.date === slotDate);
    if (!slot) return;
    setFormState({
      date: slot.date,
      status: slot.status,
      label: slot.label ?? "",
      note: slot.note ?? "",
    });
  };

  return (
    <>
      <Helmet>
        <title>Sunday Studio Portal - Secure Availability Manager</title>
      </Helmet>
      <Navbar />
      <main className="bg-muted/40 pt-24 pb-16">
        <div className="container px-6 space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Client portal</p>
              <h1 className="text-3xl md:text-4xl font-display">Login and update studio availability</h1>
              <p className="text-muted-foreground max-w-2xl">
                Authenticate with your Supabase credentials to open the booking desk. Every change here reflects instantly on the
                public calendar and booking widgets.
              </p>
              {!hasSupabaseConfig && (
                <Alert variant="destructive" className="max-w-xl">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Supabase not configured</AlertTitle>
                  <AlertDescription>
                    Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment to enable live
                    authentication and storage.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <Badge variant={session ? "secondary" : "outline"} className="gap-2 h-10">
              <Lock className="h-4 w-4" /> {session ? "Session active" : "Login required"}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <Card className="lg:col-span-1 border-primary/30 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{session ? "Signed in" : "Portal login"}</span>
                  {session ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Your Supabase session is stored locally. Use the controls on the right to update dates or end your session
                      when you’re done.
                    </p>
                    <Button className="w-full" variant="outline" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </Button>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="portal-email">Email</Label>
                      <Input
                        id="portal-email"
                        type="email"
                        placeholder="you@example.com"
                        value={credentials.email}
                        onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portal-password">Password</Label>
                      <Input
                        id="portal-password"
                        type="password"
                        placeholder="••••••••"
                        value={credentials.password}
                        onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                        required
                      />
                    </div>
                    {authError && <p className="text-sm text-destructive">{authError}</p>}
                    <Button className="w-full" type="submit" disabled={isSubmitting || !hasSupabaseConfig}>
                      <LogIn className="h-4 w-4 mr-2" /> {isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Your credentials are validated against Supabase auth. Keep this window private.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 shadow-soft">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarPlus className="h-5 w-5" /> Update availability
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set a date to Available, Hold, or Booked. Labels and notes show up instantly on the public calendar.
                </p>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSlotSubmit}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="slot-date">Date</Label>
                      <Input
                        id="slot-date"
                        type="date"
                        min={todayISO}
                        value={formState.date}
                        onChange={(event) => setFormState({ ...formState, date: event.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slot-status">Status</Label>
                      <Select
                        value={formState.status}
                        onValueChange={(value) => setFormState({ ...formState, status: value as AvailabilityStatus })}
                      >
                        <SelectTrigger id="slot-status">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="hold">Hold</SelectItem>
                          <SelectItem value="booked">Booked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slot-label">Label</Label>
                    <Input
                      id="slot-label"
                      placeholder="e.g. Fashion lookbook, Client Walkthrough"
                      value={formState.label}
                      onChange={(event) => setFormState({ ...formState, label: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-note">Note (optional)</Label>
                    <Textarea
                      id="slot-note"
                      placeholder="Add timing preferences, PO status, or anything the client should know"
                      value={formState.note}
                      onChange={(event) => setFormState({ ...formState, note: event.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <Button type="submit" disabled={isSubmitting || !session}>
                      {isSubmitting ? "Saving..." : "Save availability"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setFormState({ ...formState, label: "", note: "" })}>
                      Clear notes
                    </Button>
                    <p className="text-xs text-muted-foreground">Only authenticated users can save updates.</p>
                  </div>
                </form>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Upcoming</p>
                      <p className="font-semibold">Live availability feed</p>
                    </div>
                    <Badge variant="outline" className="gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {isLoading ? "--" : `${upcoming.length} days`}
                    </Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcoming.map((slot) => (
                          <TableRow key={slot.date}>
                            <TableCell className="font-medium">{slot.date}</TableCell>
                            <TableCell>{statusBadge(slot.status)}</TableCell>
                            <TableCell>{slot.label || "—"}</TableCell>
                            <TableCell className="max-w-xs text-muted-foreground">{slot.note || ""}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => prefillFromSlot(slot.date)}
                                  disabled={!session}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    setFormState({
                                      date: slot.date,
                                      status: "available",
                                      label: "",
                                      note: "",
                                    })
                                  }
                                  disabled={!session}
                                >
                                  Set open
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Portal;
