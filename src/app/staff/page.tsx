import StaffDashboard from "@/presentation/components/staff/StaffDashboard";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export const metadata = {
  title: "Staff Dashboard | Agnos Real-Time System",
  description: "Real-time monitoring dashboard for medical staff and intake administrators.",
};

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Main Navigation
          </Link>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <Building2 className="h-5 w-5" /> Staff Portal
          </div>
        </div>

        <StaffDashboard />
      </div>
    </main>
  );
}
