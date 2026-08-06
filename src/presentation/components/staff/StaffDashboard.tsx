"use client";

import React, { useEffect, useState } from "react";
import { useSocketConnection } from "@/presentation/hooks/useSocketConnection";
import {
  emitStaffJoin,
  onStaffAllPatients,
  onStaffReceiveUpdate,
  onStaffStatusChange,
  onStaffPatientSubmitted,
} from "@/infrastructure/websocket/socketClient";
import { PatientStatus, PatientFormData } from "@/domain/patientSchema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/presentation/components/ui/table";
import { Button } from "@/presentation/components/ui/button";
import {
  Users,
  Activity,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";
import { Input } from "@/presentation/components/ui/input";

export interface PatientSession {
  patientId: string;
  status: PatientStatus;
  data: Partial<PatientFormData>;
  submittedAt?: string;
  lastUpdated: string;
}

export const StaffDashboard: React.FC = () => {
  const { isConnected } = useSocketConnection();
  const [patients, setPatients] = useState<Map<string, PatientSession>>(new Map());
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!isConnected) return;

    // Join staff channel
    emitStaffJoin();

    // 1. Initial bulk load of active patients
    const unsubscribeAll = onStaffAllPatients((patientList) => {
      setPatients((prevMap) => {
        const nextMap = new Map(prevMap);
        patientList.forEach((p) => {
          nextMap.set(p.patientId, {
            patientId: p.patientId,
            status: p.status as PatientStatus,
            data: p.data as Partial<PatientFormData>,
            submittedAt: p.submittedAt,
            lastUpdated: p.lastUpdated || new Date().toISOString(),
          });
        });
        return nextMap;
      });
    });

    // 2. Real-time field update
    const unsubscribeUpdate = onStaffReceiveUpdate((payload) => {
      setPatients((prevMap) => {
        const nextMap = new Map(prevMap);
        const existing = nextMap.get(payload.patientId) || {
          patientId: payload.patientId,
          status: "actively_filling_in",
          data: {},
          lastUpdated: payload.updatedAt,
        };

        // Handle field update in nested/flat form
        const updatedData = { ...existing.data, [payload.field]: payload.value };

        nextMap.set(payload.patientId, {
          ...existing,
          data: updatedData,
          lastUpdated: payload.updatedAt,
        });

        return nextMap;
      });
    });

    // 3. Real-time status change
    const unsubscribeStatus = onStaffStatusChange((payload) => {
      setPatients((prevMap) => {
        const nextMap = new Map(prevMap);
        const existing = nextMap.get(payload.patientId) || {
          patientId: payload.patientId,
          status: payload.status,
          data: {},
          lastUpdated: payload.timestamp,
        };

        nextMap.set(payload.patientId, {
          ...existing,
          status: payload.status,
          lastUpdated: payload.timestamp,
        });

        return nextMap;
      });
    });

    // 4. Real-time patient submitted
    const unsubscribeSubmit = onStaffPatientSubmitted((payload) => {
      setPatients((prevMap) => {
        const nextMap = new Map(prevMap);
        const existing = nextMap.get(payload.patientId) || {
          patientId: payload.patientId,
          status: "submitted",
          data: payload.patient,
          submittedAt: payload.submittedAt,
          lastUpdated: payload.submittedAt,
        };

        nextMap.set(payload.patientId, {
          ...existing,
          status: "submitted",
          data: payload.patient,
          submittedAt: payload.submittedAt,
          lastUpdated: payload.submittedAt,
        });

        return nextMap;
      });
    });

    return () => {
      unsubscribeAll();
      unsubscribeUpdate();
      unsubscribeStatus();
      unsubscribeSubmit();
    };
  }, [isConnected]);

  const patientList = Array.from(patients.values()).sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  // Statistics
  const totalCount = patientList.length;
  const activeCount = patientList.filter((p) => p.status === "actively_filling_in").length;
  const submittedCount = patientList.filter((p) => p.status === "submitted").length;
  const inactiveCount = patientList.filter((p) => p.status === "inactive").length;

  // Filtered patients
  const filteredPatients = patientList.filter((p) => {
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const fullName = `${p.data.firstName || ""} ${p.data.lastName || ""}`.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase()) ||
      (p.data.email && p.data.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const selectedPatient = selectedPatientId ? patients.get(selectedPatientId) : null;

  const renderStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case "submitted":
        return <Badge variant="submitted">Submitted</Badge>;
      case "actively_filling_in":
        return <Badge variant="actively_filling_in">Actively filling in</Badge>;
      case "inactive":
      default:
        return <Badge variant="inactive">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Staff Monitoring Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time patient intake sessions and live draft progress tracking
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Gateway Connected
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-rose-500" />
              <span className="font-semibold text-rose-600 dark:text-rose-400">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Patient Sessions
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {totalCount}
              </h3>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Actively Filling In
              </p>
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                {activeCount}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 animate-pulse">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Submitted Records
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                {submittedCount}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Inactive Sessions
              </p>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">
                {inactiveCount}
              </h3>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area: Table + Selected Patient Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Table Column */}
        <Card className={`${selectedPatient ? "lg:col-span-2" : "lg:col-span-3"} shadow-sm`}>
          <CardHeader className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Live Patient Sessions</CardTitle>
                <CardDescription>Real-time list of all active and submitted patients</CardDescription>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search name/ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs font-medium">
                  {["all", "actively_filling_in", "submitted", "inactive"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-2.5 py-1 rounded-sm capitalize transition-colors ${
                        filterStatus === st
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      {st === "actively_filling_in"
                        ? "Active"
                        : st === "all"
                        ? "All"
                        : st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <RefreshCw className="h-8 w-8 mx-auto opacity-40 animate-spin" />
                <p className="font-medium text-base">No patient sessions found</p>
                <p className="text-xs">
                  Patients opening the intake form will automatically appear here live.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID / Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Fields Completed</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const fieldsFilled = Object.keys(patient.data || {}).filter(
                      (k) =>
                        patient.data[k as keyof PatientFormData] !== "" &&
                        patient.data[k as keyof PatientFormData] !== undefined
                    ).length;

                    const fullName =
                      patient.data.firstName || patient.data.lastName
                        ? `${patient.data.firstName || ""} ${patient.data.lastName || ""}`.trim()
                        : "Anonymous Patient";

                    const isSelected = selectedPatientId === patient.patientId;

                    return (
                      <TableRow
                        key={patient.patientId}
                        className={`cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                        onClick={() => setSelectedPatientId(patient.patientId)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {fullName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              ID: {patient.patientId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderStatusBadge(patient.status)}</TableCell>
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <div>{patient.data.phoneNumber || "—"}</div>
                            <div className="text-slate-500">{patient.data.email || "—"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {fieldsFilled} fields
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {new Date(patient.lastUpdated).toLocaleTimeString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatientId(
                                isSelected ? null : patient.patientId
                              );
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            {isSelected ? "Close" : "Inspect"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Selected Patient Live Detail Drawer / Panel */}
        {selectedPatient && (
          <Card className="lg:col-span-1 border border-blue-200 dark:border-blue-900/50 shadow-md">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-950/30 pb-3 border-b border-blue-100 dark:border-blue-900">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Live Form Inspector
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Patient ID: {selectedPatient.patientId}
                  </CardDescription>
                </div>
                {renderStatusBadge(selectedPatient.status)}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1.5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Streamed:</span>
                  <span className="font-mono">
                    {new Date(selectedPatient.lastUpdated).toLocaleString()}
                  </span>
                </div>
                {selectedPatient.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted At:</span>
                    <span className="font-mono text-emerald-600 font-semibold">
                      {new Date(selectedPatient.submittedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Field details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b pb-1">
                  Draft Data Fields
                </h4>

                {Object.keys(selectedPatient.data || {}).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No fields filled yet...</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selectedPatient.data).map(([key, val]) => {
                      if (key === "emergencyContact" && typeof val === "object" && val !== null) {
                        return (
                          <div
                            key={key}
                            className="p-2.5 bg-amber-50/50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900 text-xs space-y-1"
                          >
                            <span className="font-semibold text-amber-800 dark:text-amber-300">
                              Emergency Contact:
                            </span>
                            <div className="pl-2 space-y-0.5 text-slate-700 dark:text-slate-300">
                              <div>Name: {String((val as Record<string, unknown>).name || "—")}</div>
                              <div>Relationship: {String((val as Record<string, unknown>).relationship || "—")}</div>
                              <div>Phone: {String((val as Record<string, unknown>).phoneNumber || "—")}</div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={key}
                          className="flex flex-col p-2 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <span className="font-medium text-slate-500 dark:text-slate-400 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 break-words mt-0.5">
                            {String(val || "—")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setSelectedPatientId(null)}
              >
                Close Inspector
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
