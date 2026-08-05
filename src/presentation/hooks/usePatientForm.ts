"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientDTO } from "@/domain/schemas/patientSchema";
import { useSocketConnection } from "./useSocketConnection";
import { SOCKET_EVENTS } from "@/core/constants/socketEvents";
import { draftRepository } from "@/infrastructure/storage/draftRepository";
import { useEffect } from "react";

export function usePatientForm() {
  const { isConnected, socket } = useSocketConnection();

  const methods = useForm<PatientDTO>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      medicalHistory: "",
    },
  });

  const { handleSubmit, setValue, watch } = methods;

  useEffect(() => {
    // Load local draft on mount
    const localDraft = draftRepository.getLocalDraft();
    if (localDraft) {
      Object.entries(localDraft).forEach(([field, value]) => {
        if (value) {
          setValue(field as keyof PatientDTO, value);
        }
      });
    }

    // Listen for draft sync from socket
    const handleDraftSync = (draft: Partial<PatientDTO>) => {
      if (draft && typeof draft === "object") {
        Object.entries(draft).forEach(([field, value]) => {
          if (value) {
            setValue(field as keyof PatientDTO, value as string);
          }
        });
      }
    };

    const handleFieldUpdate = (data: { field: keyof PatientDTO; value: string }) => {
      if (data && data.field) {
        setValue(data.field, data.value);
      }
    };

    socket.on(SOCKET_EVENTS.DRAFT_SYNC, handleDraftSync);
    socket.on(SOCKET_EVENTS.FIELD_UPDATE, handleFieldUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.DRAFT_SYNC, handleDraftSync);
      socket.off(SOCKET_EVENTS.FIELD_UPDATE, handleFieldUpdate);
    };
  }, [socket, setValue]);

  const emitFieldChange = (field: keyof PatientDTO, value: string) => {
    draftRepository.saveLocalDraft({ ...watch(), [field]: value });
    if (isConnected) {
      socket.emit(SOCKET_EVENTS.FIELD_UPDATE, { field, value });
    }
  };

  const onSubmit = handleSubmit((data: PatientDTO) => {
    if (isConnected) {
      socket.emit(SOCKET_EVENTS.SUBMIT, data);
    }
    draftRepository.clearLocalDraft();
  });

  return {
    methods,
    isConnected,
    emitFieldChange,
    onSubmit,
  };
}
