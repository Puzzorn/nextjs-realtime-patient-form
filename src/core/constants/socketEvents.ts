export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  FIELD_UPDATE: "patient:field_update",
  DRAFT_SYNC: "patient:draft_sync",
  SUBMIT: "patient:submit",
  SUBMITTED: "patient:submitted",
} as const;

export type SocketEventType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
