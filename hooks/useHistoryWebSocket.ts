"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HistoryEvent, TranscriptEntry } from "@/types/dashboard";

const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000").replace("http://", "ws://").replace("https://", "wss://");

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
        const data: HistoryEvent = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            setConnectionState("connected");
            break;
          case "next_question":
            if (data.question) {
              setCurrentQuestion(data.question);
              setTranscript((prev) => [
                ...prev,
                { role: "assistant", content: data.question!, timestamp: new Date().toISOString() },
              ]);
            }
            break;
          case "transcript":
            if (data.transcript) {
              setTranscript(data.transcript);
            }
            break;
          case "interview_completed":
            setConnectionState("completed");
            setCurrentQuestion("Interview completed. Thank you!");
            break;
          case "error":
            setError(data.message ?? "Unknown error");
            setConnectionState("error");
            break;
          default:
            // Handle raw text questions
            if (data.message) {
              setCurrentQuestion(data.message);
              setTranscript((prev) => [
                ...prev,
                { role: "assistant", content: data.message!, timestamp: new Date().toISOString() },
              ]);
            }
        }
      } catch {
        // Non-JSON message — treat as question text
        if (event.data) {
          setCurrentQuestion(String(event.data));
          setTranscript((prev) => [
            ...prev,
            { role: "assistant", content: String(event.data), timestamp: new Date().toISOString() },
          ]);
        }
      }
    };

    socket.onerror = () => {
      setConnectionState("error");
      setError("WebSocket connection failed. Check that the backend is running.");
    };

    socket.onclose = () => {
      if (connectionState !== "completed") {
        setConnectionState("disconnected");
      }
    };
  }, [encounterId, token, connectionState]);

  const disconnect = useCallback(() => {
    ws.current?.close();
    ws.current = null;
    setConnectionState("disconnected");
  }, []);

  const sendText = useCallback((text: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "text", text }));
      // Optimistically add to transcript
      setTranscript((prev) => [
        ...prev,
        { role: "patient", content: text, timestamp: new Date().toISOString() },
      ]);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => { ws.current?.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  return { connectionState, currentQuestion, transcript, error, connect, disconnect, sendText };
}
