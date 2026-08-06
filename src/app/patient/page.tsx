import PatientForm from "@/presentation/components/patient/PatientForm";
import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";

export const metadata = {
  title: "Patient Intake Form | Agnos System",
  description: "Real-Time Patient Registration and Intake Form",
};

export default function PatientPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Main Navigation
          </Link>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <Stethoscope className="h-5 w-5" /> Agnos Health Portal
          </div>
        </div>

        <PatientForm />
      </div>
    </main>
  );
}
