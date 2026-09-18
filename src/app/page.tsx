import Link from "next/link";
import { UserPlus, LayoutDashboard, Stethoscope, ShieldCheck, Zap, Radio } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";

export const metadata = {
  title: "CareSync Real-Time Patient Intake System",
  description: "Real-Time Patient Intake & Staff Monitoring Dashboard",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-5xl mx-auto w-full space-y-12 my-auto">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Radio className="h-3.5 w-3.5 text-blue-500 animate-pulse" /> Live Socket.io Gateway Operational
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            CareSync Real-Time <span className="text-blue-600 dark:text-blue-400">Patient System</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Seamless real-time patient registration and live staff monitoring portal powered by WebSockets, Next.js, and Socket.io.
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Patient Portal */}
          <Link href="/patient" className="group block">
            <Card className="h-full border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md group-hover:-translate-y-1">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserPlus className="h-7 w-7" />
                  </div>
                  <Badge variant="actively_filling_in">Patient Portal</Badge>
                </div>
                <CardTitle className="text-xl font-bold mt-4 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Patient Intake Form
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Fill out your personal registration details. Your input streams in real-time to hospital staff with auto-save and debouncing.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  Open Patient Form &rarr;
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 2: Staff Dashboard */}
          <Link href="/staff" className="group block">
            <Card className="h-full border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md group-hover:-translate-y-1">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <LayoutDashboard className="h-7 w-7" />
                  </div>
                  <Badge variant="submitted">Staff Portal</Badge>
                </div>
                <CardTitle className="text-xl font-bold mt-4 text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Staff Monitoring Dashboard
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Monitor live patient registration activity, track status changes in real-time, and inspect active drafts as they are typed.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  Access Staff Dashboard &rarr;
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-center max-w-4xl mx-auto">
          <div className="p-4 space-y-1">
            <Zap className="h-5 w-5 mx-auto text-amber-500" />
            <h4 className="text-sm font-semibold">200ms Field Streaming</h4>
            <p className="text-xs text-slate-500">Instant debounced draft synchronization</p>
          </div>
          <div className="p-4 space-y-1">
            <ShieldCheck className="h-5 w-5 mx-auto text-blue-500" />
            <h4 className="text-sm font-semibold">3-State Lifecycle</h4>
            <p className="text-xs text-slate-500">Actively filling in, Inactive, & Submitted</p>
          </div>
          <div className="p-4 space-y-1">
            <Stethoscope className="h-5 w-5 mx-auto text-emerald-500" />
            <h4 className="text-sm font-semibold">Zod & React Hook Form</h4>
            <p className="text-xs text-slate-500">Strict schema validation & locked submission</p>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 dark:text-slate-500 pt-8">
        &copy; {new Date().getFullYear()} CareSync Health Technologies. All rights reserved.
      </footer>
    </main>
  );
}
