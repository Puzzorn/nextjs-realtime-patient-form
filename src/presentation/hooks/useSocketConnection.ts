"use client";

import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, getSocketClient } from "@/infrastructure/websocket/socketClient";
import { SOCKET_EVENTS } from "@/core/constants/socketEvents";

export function useSocketConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = connectSocket();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on(SOCKET_EVENTS.CONNECT, onConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, onConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
      disconnectSocket();
    };
  }, []);

  return { isConnected, socket: getSocketClient() };
}
