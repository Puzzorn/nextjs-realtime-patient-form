import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/core/constants/socketEvents";
import {
  PatientJoinPayload,
  PatientFieldUpdatePayload,
  PatientStatusChangePayload,
  PatientSubmitPayload,
  PatientDraftSyncPayload,
  StaffReceiveUpdatePayload,
  StaffStatusChangePayload,
  StaffPatientSubmittedPayload,
} from "@/domain/patientSchema";

const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const getSocketClient = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocketClient();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

/**
 * Emit Methods
 */
export const emitPatientJoin = (payload: PatientJoinPayload): void => {
  const s = getSocketClient();
  s.emit(SOCKET_EVENTS.PATIENT_JOIN, payload);
};

export const emitPatientFieldUpdate = (payload: PatientFieldUpdatePayload): void => {
  const s = getSocketClient();
  s.emit(SOCKET_EVENTS.PATIENT_FIELD_UPDATE, payload);
};

export const emitPatientStatusChange = (payload: PatientStatusChangePayload): void => {
  const s = getSocketClient();
  s.emit(SOCKET_EVENTS.PATIENT_STATUS_CHANGE, payload);
};

export const emitPatientSubmit = (payload: PatientSubmitPayload): void => {
  const s = getSocketClient();
  s.emit(SOCKET_EVENTS.PATIENT_SUBMIT, payload);
};

export const emitStaffJoin = (): void => {
  const s = getSocketClient();
  s.emit(SOCKET_EVENTS.STAFF_JOIN);
};

/**
 * Event Listener Subscriptions
 */
export const onPatientDraftSync = (
  callback: (payload: PatientDraftSyncPayload) => void
): (() => void) => {
  const s = getSocketClient();
  s.on(SOCKET_EVENTS.PATIENT_DRAFT_SYNC, callback);
  return () => {
    s.off(SOCKET_EVENTS.PATIENT_DRAFT_SYNC, callback);
  };
};

export const onStaffReceiveUpdate = (
  callback: (payload: StaffReceiveUpdatePayload) => void
): (() => void) => {
  const s = getSocketClient();
  s.on(SOCKET_EVENTS.STAFF_RECEIVE_UPDATE, callback);
  return () => {
    s.off(SOCKET_EVENTS.STAFF_RECEIVE_UPDATE, callback);
  };
};

export const onStaffStatusChange = (
  callback: (payload: StaffStatusChangePayload) => void
): (() => void) => {
  const s = getSocketClient();
  s.on(SOCKET_EVENTS.STAFF_STATUS_CHANGE, callback);
  return () => {
    s.off(SOCKET_EVENTS.STAFF_STATUS_CHANGE, callback);
  };
};

export const onStaffPatientSubmitted = (
  callback: (payload: StaffPatientSubmittedPayload) => void
): (() => void) => {
  const s = getSocketClient();
  s.on(SOCKET_EVENTS.STAFF_PATIENT_SUBMITTED, callback);
  return () => {
    s.off(SOCKET_EVENTS.STAFF_PATIENT_SUBMITTED, callback);
  };
};

export const onStaffAllPatients = (
  callback: (patients: Array<{ patientId: string; status: string; data: Record<string, unknown>; submittedAt?: string; lastUpdated: string }>) => void
): (() => void) => {
  const s = getSocketClient();
  s.on(SOCKET_EVENTS.STAFF_ALL_PATIENTS, callback);
  return () => {
    s.off(SOCKET_EVENTS.STAFF_ALL_PATIENTS, callback);
  };
};
