"use client";

import { useEffect, useMemo, useRef } from "react";
import { io, type Socket } from "socket.io-client";

type NewMessageHandler = (msg: unknown) => void;

export function useConversationSocket(
  conversationId: string | null,
  onNewMessage: NewMessageHandler,
) {
  const socketRef = useRef<Socket | null>(null);

  const backendUrl = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3333"
    );
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    if (!socketRef.current) {
      socketRef.current = io(backendUrl, {
        transports: ["websocket"],
      });
    }

    const socket = socketRef.current;
    socket.emit("join", conversationId);

    const handler = (msg: unknown) => onNewMessage(msg);
    socket.on("new_message", handler);

    return () => {
      socket.off("new_message", handler);
    };
  }, [backendUrl, conversationId, onNewMessage]);
}

