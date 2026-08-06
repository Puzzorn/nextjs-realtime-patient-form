export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  PATIENT_JOIN: "patient:join",
  PATIENT_FIELD_UPDATE: "patient:field_update",
  PATIENT_STATUS_CHANGE: "patient:status_change",
  PATIENT_SUBMIT: "patient:submit",
  PATIENT_DRAFT_SYNC: "patient:draft_sync",
  STAFF_JOIN: "staff:join",
  STAFF_RECEIVE_UPDATE: "staff:receive_update",
  STAFF_STATUS_CHANGE: "staff:status_change",
  STAFF_PATIENT_SUBMITTED: "staff:patient_submitted",
  STAFF_ALL_PATIENTS: "staff:all_patients",
} as const;

export type SocketEventType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

