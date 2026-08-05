import PatientForm from "@/presentation/components/PatientForm";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Agnos Real-Time Patient System
        </h1>
        <PatientForm />
      </div>
    </main>
  );
}
