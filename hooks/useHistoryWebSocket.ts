"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HistoryEvent, TranscriptEntry } from "@/types/dashboard";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
if (!WS_URL) {
  throw new Error("NEXT_PUBLIC_WS_URL is not set.");
}
const WS_BASE = WS_URL.replace("http://", "ws://").replace("https://", "wss://");

type ConnectionState = "disconnected" | "connecting" | "connected" | "error" | "completed";

interface UseHistoryWebSocketOptions {
  encounterId: string;
  autoConnect?: boolean;
}

export function useHistoryWebSocket({ encounterId, autoConnect = false }: UseHistoryWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const addAssistantMessage = useCallback((content: string) => {
    if (!content) return;
    setCurrentQuestion(content);
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant" && last.content === content) {
        return prev;
      }
      return [
        ...prev,
        { role: "assistant", content, timestamp: new Date().toISOString() },
      ];
    });
  }, []);

  const addPatientMessage = useCallback((content: string) => {
    if (!content) return;
    setTranscript((prev) => [
      ...prev,
      { role: "patient", content, timestamp: new Date().toISOString() },
    ]);
  }, []);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setConnectionState("connecting");
    setError(null);

    const url = `${WS_BASE}/api/v1/encounters/${encounterId}/ws${token ? `?token=${token}` : ""}`;
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      setConnectionState("connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Prioritize Arabic question fields from backend
        const questionText =
          data.next_question_arabic ||
          data.initial_question_arabic ||
          data.next_question_english ||
          data.initial_question_english ||
          data.next_question ||
          data.question ||
          data.message;

        if (data.type === "interview_completed" || data.status === "COMPLETED") {
          setConnectionState("completed");
          if (questionText) setCurrentQuestion(questionText);
          return;
        }

        if (questionText) {
          addAssistantMessage(questionText);
        }

        if (data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0) {
          setTranscript(data.transcript);
        }
      } catch {
        if (event.data) {
          const textMsg = String(event.data);
          addAssistantMessage(textMsg);
        }
      }
    };

    socket.onerror = () => {
      setConnectionState("error");
      setError("WebSocket fallback to REST active.");
    };

    socket.onclose = () => {
      if (connectionState !== "completed") {
        setConnectionState("disconnected");
      }
    };
  }, [encounterId, token, connectionState, addAssistantMessage]);

  const disconnect = useCallback(() => {
    ws.current?.close();
    ws.current = null;
    setConnectionState("disconnected");
  }, []);

  const sendTextWS = useCallback((text: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ text, user_input: text }));
    }
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => { ws.current?.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  return {
    connectionState,
    currentQuestion,
    setCurrentQuestion,
    transcript,
    setTranscript,
    error,
    connect,
    disconnect,
    sendTextWS,
    addAssistantMessage,
    addPatientMessage,
  };
}
