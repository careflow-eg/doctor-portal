"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HistoryEvent, TranscriptEntry } from "@/types/dashboard";

const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL ?? "wss://api.careflowai.health")
  .replace("http://", "ws://")
  .replace("https://", "wss://");
const WS_PREFIX = process.env.NEXT_PUBLIC_WS_PREFIX ?? "/api/v1";

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

  const connect = useCallback(() => {
    if (!encounterId) return;

    try {
      setConnectionState("connecting");
      setError(null);

      const url = `${WS_BASE.replace(/\/$/, "")}${WS_PREFIX}/ws/history/${encounterId}`;
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setConnectionState("connected");
      };

      ws.current.onmessage = (event) => {
        try {
          const data: HistoryEvent = JSON.parse(event.data);
          
          if (data.event_type === "question_generated" && data.question) {
            setCurrentQuestion(data.question);
          } else if (data.event_type === "turn_completed") {
            if (data.doctor_input) {
              setTranscript((prev) => [
                ...prev,
                { role: "doctor", text: data.doctor_input! },
              ]);
            }
            if (data.question) {
              setTranscript((prev) => [
                ...prev,
                { role: "patient", text: data.question! },
              ]);
            }
          } else if (data.event_type === "interview_completed") {
            setConnectionState("completed");
          } else if (data.event_type === "error") {
            setError(data.message || "WebSocket error occurred");
            setConnectionState("error");
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.current.onerror = (e) => {
        console.error("WebSocket error:", e);
        setError("Connection error");
        setConnectionState("error");
      };

      ws.current.onclose = () => {
        if (connectionState !== "completed") {
          setConnectionState("disconnected");
        }
      };
    } catch (e) {
      console.error("Failed to connect WebSocket:", e);
      setError("Failed to create connection");
      setConnectionState("error");
    }
  }, [encounterId, connectionState]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setConnectionState("disconnected");
    }
  }, []);

  const sendResponse = useCallback((response: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ response }));
      setTranscript((prev) => [...prev, { role: "doctor", text: response }]);
    }
  }, []);

  const sendTextWS = useCallback((text: string) => {
    sendResponse(text);
  }, [sendResponse]);

  const addAssistantMessage = useCallback((text: string) => {
    setTranscript((prev) => [...prev, { role: "assistant", text }]);
  }, []);

  const addPatientMessage = useCallback((text: string) => {
    setTranscript((prev) => [...prev, { role: "patient", text }]);
  }, []);

  useEffect(() => {
    if (autoConnect && encounterId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, encounterId]);

  return {
    connectionState,
    currentQuestion,
    setCurrentQuestion,
    transcript,
    error,
    connect,
    disconnect,
    sendResponse,
    sendTextWS,
    addAssistantMessage,
    addPatientMessage,
  };
}
