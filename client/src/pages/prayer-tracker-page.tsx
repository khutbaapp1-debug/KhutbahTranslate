import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Clock, 
  Plus, 
  Check, 
  Calendar,
  ArrowLeft,
  Sunrise,
  Sun,
  SunDim,
  Sunset,
  Moon,
  Target,
  TrendingUp,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { MissedPrayer } from "@shared/schema";

const prayerIcons: Record<string, typeof Sun> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: SunDim,
  maghrib: Sunset,
  isha: Moon,
};

const prayerNames: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const formSchema = z.object({
  prayerType: z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']),
  dateMissed: z.date(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Stats {
  total: number;
  madeUp: number;
  remaining: number;
  daysNeeded: number;
  estimatedCompletionDate: string | null;
  makeupPerDay: number;
}

export default function PrayerTrackerPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prayerType: 'fajr',
      dateMissed: new Date(),
      notes: '',
    },
  });

  const { data: prayers, isLoading: prayersLoading } = useQuery<MissedPrayer[]>({
    queryKey: ['/api/missed-prayers'],
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/missed-prayers/stats'],
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/missed-prayers', {
        prayerType: data.prayerType,
        dateMissed: data.dateMissed.toISOString(),
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missed-prayers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/missed-prayers/stats'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Prayer logged",
        description: "Missed prayer has been added to your tracker.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add prayer",
        variant: "destructive",
      });
    },
  });

  const makeupMutation = useMutation({
    mutationFn: async ({ id, madeUp }: { id: string; madeUp: boolean }) => {
      return apiRequest('PATCH', `/api/missed-prayers/${id}`, { madeUp });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missed-prayers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/missed-prayers/stats'] });
      toast({
        title: "Updated",
        description: "Prayer status updated successfully.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/missed-prayers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missed-prayers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/missed-prayers/stats'] });
      toast({
        title: "Deleted",
        description: "Prayer entry removed.",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    addMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-nav">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
          <div className="p-4 max-w-screen-xl mx-auto">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Clock className="w-6 h-6 text-primary" />
              Prayer Tracker
            </h1>
          </div>
        </header>

        <main className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Sign In Required</h2>
              <p className="text-muted-foreground">
                Sign in to track your missed prayers and makeup progress.
              </p>
              <Button className="w-full" onClick={() => { window.location.href = "/api/login"; }} data-testid="button-signin">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>

        <BottomNav />
      </div>
    );
  }

  const isLoading = prayersLoading || statsLoading;
  const remainingPrayers = prayers?.filter(p => !p.madeUp) || [];
  const completedPrayers = prayers?.filter(p => p.madeUp) || [];
  const progressPercent = stats?.total ? (stats.madeUp / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
                  <Clock className="w-6 h-6 text-primary" />
                  Prayer Tracker
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Qada (Makeup) Prayers
                </p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-prayer">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Missed Prayer</DialogTitle>
                  <DialogDescription>
                    Add a prayer you need to make up.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="prayerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prayer</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-prayer-type">
                                <SelectValue placeholder="Select prayer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(prayerNames).map(([value, label]) => (
                                <SelectItem key={value} value={value} data-testid={`option-${value}`}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateMissed"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date Missed</FormLabel>
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                  data-testid="button-date-picker"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setCalendarOpen(false);
                                }}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any notes about this prayer..."
                              className="resize-none"
                              {...field}
                              data-testid="input-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={addMutation.isPending}
                      data-testid="button-submit"
                    >
                      {addMutation.isPending ? "Adding..." : "Add Prayer"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-lg mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" data-testid="text-remaining">{stats?.remaining || 0}</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" data-testid="text-completed">{stats?.madeUp || 0}</p>
                      <p className="text-xs text-muted-foreground">Made Up</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {stats && stats.total > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {stats.madeUp} of {stats.total} prayers
                    </span>
                    <span className="font-medium text-primary">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  {stats.remaining > 0 && stats.estimatedCompletionDate && (
                    <p className="text-sm text-muted-foreground">
                      At 1 makeup per day, you'll complete in ~{stats.daysNeeded} days
                      <br />
                      <span className="text-xs">
                        (by {format(new Date(stats.estimatedCompletionDate), 'MMM d, yyyy')})
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {remainingPrayers.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold px-1">Prayers to Make Up</h2>
                {remainingPrayers.map((prayer) => {
                  const Icon = prayerIcons[prayer.prayerType];
                  return (
                    <Card key={prayer.id} className="hover-elevate" data-testid={`card-prayer-${prayer.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{prayerNames[prayer.prayerType]}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(prayer.dateMissed), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => makeupMutation.mutate({ id: prayer.id, madeUp: true })}
                              disabled={makeupMutation.isPending}
                              data-testid={`button-makeup-${prayer.id}`}
                            >
                              <Check className="w-4 h-4 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(prayer.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${prayer.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {prayer.notes && (
                          <p className="text-sm text-muted-foreground mt-2 pl-13">
                            {prayer.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {completedPrayers.length > 0 && (
              <div className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold px-1 text-muted-foreground">Completed</h2>
                {completedPrayers.slice(0, 5).map((prayer) => {
                  const Icon = prayerIcons[prayer.prayerType];
                  return (
                    <Card 
                      key={prayer.id} 
                      className="opacity-60"
                      data-testid={`card-completed-${prayer.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium line-through text-muted-foreground">
                                {prayerNames[prayer.prayerType]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Made up on {prayer.dateMadeUp ? format(new Date(prayer.dateMadeUp), 'MMM d') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                            <Check className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {completedPrayers.length > 5 && (
                  <p className="text-sm text-center text-muted-foreground">
                    +{completedPrayers.length - 5} more completed
                  </p>
                )}
              </div>
            )}

            {prayers?.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Check className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">No Missed Prayers</h2>
                  <p className="text-muted-foreground">
                    You're all caught up! Use the Add button to log any missed prayers.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
