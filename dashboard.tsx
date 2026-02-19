import { useAuth } from "@/hooks/use-auth";
import { useBuses, useUpdateBusStatus } from "@/hooks/use-buses";
import { useNotices } from "@/hooks/use-notices";
import { useMyPass, usePasses, useApprovePass } from "@/hooks/use-passes";
import { useRoutes } from "@/hooks/use-routes";
import { BusStatusBadge } from "@/components/ui/bus-status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { Bus, MapPin, Users, TicketCheck, AlertCircle, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const passSchema = z.object({
  routeId: z.string().min(1, "Route is required"),
  boardingStop: z.string().min(1, "Boarding stop is required"),
  branch: z.string().min(1, "Branch is required"),
  passingYear: z.string().min(4, "Invalid year").max(4, "Invalid year"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  email: z.string().email("Invalid email"),
  emergencyContact: z.string().min(10, "Invalid contact"),
  photoUrl: z.string().optional(),
  feeReceiptUrl: z.string().optional(),
});

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-8 animate-slide-up p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Welcome, {user.fullName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Role: <span className="capitalize font-medium text-primary">{user.role}</span></p>
        </div>
        <div className="hidden md:block">
          <Badge variant="outline" className="text-xs">{format(new Date(), 'EEEE, MMMM do')}</Badge>
        </div>
      </div>

      {user.role === 'student' && <StudentDashboard />}
      {user.role === 'driver' && <DriverDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  );
}

function StudentDashboard() {
  const { data: pass, isLoading: passLoading } = useMyPass();
  const { data: buses } = useBuses();
  const { data: routes } = useRoutes();
  const { data: notices } = useNotices();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);

  const myBus = buses?.find(b => b.id === pass?.busId);
  const myRoute = routes?.find(r => r.id === pass?.routeId);

  const form = useForm<z.infer<typeof passSchema>>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      routeId: "",
      boardingStop: "",
      branch: "",
      passingYear: "",
      phoneNumber: "",
      email: "",
      emergencyContact: "",
    }
  });

  const selectedRouteId = form.watch("routeId");
  const selectedRoute = routes?.find(r => r.id === Number(selectedRouteId));

  async function onSubmit(values: z.infer<typeof passSchema>) {
    try {
      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, routeId: Number(values.routeId) }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      toast({ title: "Application Submitted", description: "Your bus pass request is pending approval." });
      setIsApplying(false);
      window.location.reload(); // Refresh to show pending status
    } catch (err) {
      toast({ title: "Error", description: "Could not submit application.", variant: "destructive" });
    }
  }

  if (isApplying) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg border-primary/10">
        <CardHeader className="bg-primary/5 rounded-t-xl">
          <CardTitle className="text-2xl font-display">Bus Pass Application</CardTitle>
          <CardDescription>Fill in your details to apply for the digital transport pass.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="branch" render={({ field }) => (
                  <FormItem><FormLabel>Branch / Course</FormLabel><FormControl><Input placeholder="e.g. CSE" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="passingYear" render={({ field }) => (
                  <FormItem><FormLabel>Passing Year</FormLabel><FormControl><Input placeholder="2025" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="routeId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Route</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Choose a route" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {routes?.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.routeName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="boardingStop" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boarding Stop</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedRoute}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Choose a stop" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {selectedRoute?.stops.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email ID</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="emergencyContact" render={({ field }) => (
                  <FormItem><FormLabel>Emergency Contact</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsApplying(false)}>Cancel</Button>
                <Button type="submit">Submit Application</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Active Bus Track */}
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-blue-700 text-white shadow-2xl">
          <CardContent className="p-8 relative">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Bus size={120} /></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
               <div className="space-y-4">
                 <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">LIVE TRACKING</Badge>
                 <h2 className="text-4xl font-display font-black tracking-tight">
                   {myBus ? myRoute?.routeName : "No Active Route"}
                 </h2>
                 <div className="flex items-center gap-2 text-blue-100">
                   <MapPin size={18} />
                   <span className="text-lg font-medium">{myBus?.currentStatus || "Bus system offline"}</span>
                 </div>
               </div>
               <div className="flex flex-col items-end justify-between">
                 <div className="text-right">
                    <p className="text-xs uppercase font-bold tracking-widest text-blue-200">Bus Number</p>
                    <p className="text-2xl font-mono font-black">{myBus?.busNumber || "---"}</p>
                 </div>
                 {myBus && (
                   <div className="mt-4 flex gap-3">
                     <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                        <p className="text-[10px] uppercase font-bold text-blue-200">Seats Available</p>
                        <p className="text-lg font-bold">~ {myBus.totalSeats - 5}</p>
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Notices */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold">Recent Updates</h3>
            <Button variant="ghost" size="sm">View Notice Board</Button>
          </div>
          <div className="grid gap-4">
            {notices?.slice(0, 3).map(notice => (
              <Card key={notice.id} className="hover-elevate transition-all border-l-4 border-l-primary">
                <CardContent className="p-5">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-lg">{notice.title}</h4>
                    <Badge variant={notice.category === 'emergency' ? 'destructive' : 'secondary'}>{notice.category}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 line-clamp-2">{notice.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Pass Status Card */}
        <Card className="shadow-lg border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketCheck className="text-primary" />
              Digital Pass
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passLoading ? <Skeleton className="h-48 w-full" /> : pass ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={
                    pass.status === 'approved' ? 'bg-green-500' : 
                    pass.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }>
                    {pass.status?.toUpperCase()}
                  </Badge>
                </div>
                {pass.status === 'approved' ? (
                  <div className="pt-2 text-center">
                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-primary/20 inline-block mb-4">
                       <QRCodeSVG value={pass.qrCode || "PENDING"} size={120} />
                    </div>
                    <Link href="/my-pass">
                      <Button className="w-full">Open Digital ID</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-muted rounded-xl space-y-3">
                    <Clock className="mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Your application is being reviewed by the transport coordinator.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <FileText className="mx-auto w-12 h-12 text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground">You haven't applied for a transport pass yet.</p>
                <Button onClick={() => setIsApplying(true)} className="w-full">Apply Now</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DriverDashboard() {
  const { user } = useAuth();
  const { data: buses } = useBuses();
  const { mutate: updateStatus } = useUpdateBusStatus();
  const myBus = buses?.find(b => b.driverId === user?.id);

  if (!myBus) return <Card className="p-12 text-center border-dashed"><CardHeader><CardTitle>No Bus Assigned</CardTitle><CardDescription>Please contact the admin for route assignment.</CardDescription></CardHeader></Card>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="font-display">Route Control Panel</CardTitle>
          <CardDescription>Update your status manually for students to track.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
             <p className="text-xs font-bold text-primary uppercase mb-1">Current Active Route</p>
             <p className="text-xl font-bold">{myBus.busNumber} - Route {myBus.routeId}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Starting", "Stop 1", "Stop 2", "Halfway", "Approaching", "Arrived", "Garage"].map(status => (
              <Button 
                key={status}
                variant={myBus.currentStatus === status ? "default" : "outline"}
                onClick={() => updateStatus({ id: myBus.id, currentStatus: status })}
                className="h-16 font-bold text-lg rounded-2xl shadow-sm"
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        <StatCard label="Students Riding" value="28" icon={<Users className="w-6 h-6" />} color="secondary" />
        <Card>
          <CardHeader><CardTitle>Evening Return</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
               <span>Students Confirmed for Return</span>
               <Badge className="text-lg">22 / 28</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: passes } = usePasses();
  const { data: buses } = useBuses();
  const { data: routes } = useRoutes();
  const { mutate: approvePass } = useApprovePass();
  const { toast } = useToast();

  const pendingPasses = passes?.filter(p => p.status === 'pending') || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pending Applications" value={pendingPasses.length} icon={<TicketCheck />} color="accent" />
        <StatCard label="Active Buses" value={buses?.length || 0} icon={<Bus />} color="primary" />
        <StatCard label="Total Routes" value={routes?.length || 0} icon={<MapPin />} color="secondary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transport Pass Applications</CardTitle>
          <CardDescription>Review and approve student transport requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {pendingPasses.length === 0 && <p className="py-8 text-center text-muted-foreground">No pending applications.</p>}
            {pendingPasses.map(pass => {
              const route = routes?.find(r => r.id === pass.routeId);
              return (
                <div key={pass.id} className="py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-lg">User ID: {pass.userId}</h4>
                    <p className="text-sm text-muted-foreground">
                      Requested: <span className="font-medium text-foreground">{route?.routeName}</span> | Stop: <span className="font-medium text-foreground">{pass.boardingStop}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => approvePass({ id: pass.id, status: 'rejected' })}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" onClick={() => {
                      const busId = buses?.find(b => b.routeId === pass.routeId)?.id;
                      approvePass({ 
                        id: pass.id, 
                        status: 'approved', 
                        busId: busId, 
                        validUntil: new Date(new Date().getFullYear(), 11, 31).toISOString() 
                      });
                      toast({ title: "Approved", description: "Pass generated and bus assigned." });
                    }}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve & Assign
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
