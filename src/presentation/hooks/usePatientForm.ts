"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientFormData, PatientStatus } from "@/domain/patientSchema";
import { useSocketConnection } from "./useSocketConnection";
import {
  emitPatientJoin,
  emitPatientFieldUpdate,
  emitPatientStatusChange,
  emitPatientSubmit,
  onPatientDraftSync,
} from "@/infrastructure/websocket/socketClient";
import { draftRepository } from "@/infrastructure/storage/draftRepository";
import { useEffect, useState, useRef, useCallback } from "react";

export function usePatientForm() {
  const { isConnected } = useSocketConnection();
  const [patientId, setPatientId] = useState<string>("");
  const [status, setStatus] = useState<PatientStatus>("inactive");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStatusRef = useRef<PatientStatus>("inactive");

  // Keep ref synchronized with status state
  useEffect(() => {
    currentStatusRef.current = status;
  }, [status]);

  // Initialize persistent patient ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("patient_id");
      if (!id) {
        id = "PAT-" + Math.random().toString(36).substring(2, 9).toUpperCase();
        localStorage.setItem("patient_id", id);
      }
      setPatientId(id);
    }
  }, []);

  const methods = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      dateOfBirth: "",
      gender: "",
      phoneNumber: "",
      email: "",
      address: "",
      preferredLanguage: "",
      nationality: "",
      religion: "",
      emergencyContact: undefined,
    },
  });

  const { handleSubmit, setValue, watch } = methods;

  // Handle patient join and draft sync
  useEffect(() => {
    if (!patientId || !isConnected) return;

    emitPatientJoin({ patientId });

    const unsubscribeDraftSync = onPatientDraftSync((payload) => {
      if (payload && payload.data) {
        Object.entries(payload.data).forEach(([field, value]) => {
          if (value !== undefined && value !== null) {
            setValue(
              field as keyof PatientFormData,
              value as PatientFormData[keyof PatientFormData]
            );
          }
        });
      }
      if (payload && payload.status) {
        setStatus(payload.status);
        if (payload.status === "submitted") {
          setIsSubmitted(true);
        }
      }
    });

    return () => {
      unsubscribeDraftSync();
    };
  }, [patientId, isConnected, setValue]);

  // Activity & Inactivity Timer logic (3000ms timer)
  const resetInactivityTimer = useCallback(() => {
    if (currentStatusRef.current === "submitted") return;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (currentStatusRef.current !== "actively_filling_in") {
      setStatus("actively_filling_in");
      if (patientId && isConnected) {
        emitPatientStatusChange({
          patientId,
          status: "actively_filling_in",
          timestamp: new Date().toISOString(),
        });
      }
    }

    inactivityTimerRef.current = setTimeout(() => {
      if (currentStatusRef.current !== "submitted") {
        setStatus("inactive");
        if (patientId && isConnected) {
          emitPatientStatusChange({
            patientId,
            status: "inactive",
            timestamp: new Date().toISOString(),
          });
        }
      }
    }, 3000);
  }, [patientId, isConnected]);

  // Debounced Field Update (200ms)
  const handleFieldChange = useCallback(
    (field: keyof PatientFormData | string, value: unknown) => {
      if (isSubmitted) return;

      resetInactivityTimer();

      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field]);
      }

      debounceTimers.current[field] = setTimeout(() => {
        if (patientId && isConnected) {
          emitPatientFieldUpdate({
            patientId,
            field,
            value,
          });
        }
      }, 200);

      const currentValues = watch();
      draftRepository.saveLocalDraft(currentValues as Partial<PatientFormData>);
    },
    [isSubmitted, patientId, isConnected, resetInactivityTimer, watch]
  );

  // Submit Handler
  const onSubmit = handleSubmit((data: PatientFormData) => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    setStatus("submitted");
    setIsSubmitted(true);

    const now = new Date().toISOString();

    if (patientId && isConnected) {
      emitPatientStatusChange({
        patientId,
        status: "submitted",
        timestamp: now,
      });
      emitPatientSubmit({
        patientId,
        data,
        submittedAt: now,
      });
    }

    draftRepository.clearLocalDraft();
  });

  return {
    patientId,
    methods,
    isConnected,
    isSubmitted,
    status,
    handleFieldChange,
    resetInactivityTimer,
    onSubmit,
  };
}
