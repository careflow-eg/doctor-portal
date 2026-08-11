"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HistoryEvent, TranscriptEntry } from "@/types/dashboard";
import { historyService } from "@/services/historyService";

const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL ?? "wss://api.careflowai.health")
  .replace("http://", "ws://")
  .replace("https://", "wss://");
const WS_PREFIX = process.env.NEXT_PUBLIC_WS_PREFIX ?? "/api/v1";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error" | "completed";

interface UseHistoryWebSocketOptions {
  encounterId: string;
  autoConnect?: boolean;
  onTerminate?: () => void;
}

export function useHistoryWebSocket({ encounterId, autoConnect = false, onTerminate }: UseHistoryWebSocketOptions) {
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

      const url = `${WS_BASE.replace(/\/$/, "")}${WS_PREFIX}/encounters/${encounterId}/ws`;
      console.log("Connecting WebSocket to:", url);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log("WebSocket connected successfully for encounter:", encounterId);
        setConnectionState("connected");
      };

      ws.current.onmessage = async (event) => {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          console.log("WebSocket message received:", data);

          // 1. Check should_continue === false or should_terminate === true
          const isTerminated = Boolean(
            data.should_continue === false ||
            data.should_terminate === true ||
            (data.data && (data.data.should_continue === false || data.data.should_terminate === true)) ||
            data.is_completed === true ||
            data.event_type === "interview_completed" ||
            data.status === "COMPLETED"
          );

          if (isTerminated) {
            const completionMessage =
              data.next_question_arabic ||
              data.next_question_english ||
              data.message ||
              "تم الانتهاء من تجميع التاريخ الطبي بنجاح.";

            setCurrentQuestion(completionMessage);
            setTranscript((prev) => [
              ...prev,
              { role: "assistant", text: completionMessage, content: completionMessage, timestamp: new Date().toISOString() },
            ]);
            setConnectionState("completed");

            try {
              await historyService.finishHistorySession(encounterId);
            } catch (finishErr) {
              console.warn("Error triggering finishHistorySession on WebSocket termination:", finishErr);
            }

            onTerminate?.();
            return;
          }

          // 2. If should_continue is true, render the next question from backend
          const aiText =
            data.next_question_arabic ||
            data.next_question_english ||
            data.next_question ||
            data.question ||
            data.message ||
            (data.event_type === "question_generated" ? data.question : null);

          if (aiText) {
            setCurrentQuestion(aiText);
            setTranscript((prev) => [
              ...prev,
              { role: "assistant", text: aiText, content: aiText, timestamp: new Date().toISOString() },
            ]);
          }

          if (data.event_type === "error" || data.error) {
            setError(data.message || data.error || "WebSocket error occurred");
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e, event.data);
        }
      };

      ws.current.onerror = (e) => {
        console.error("WebSocket connection error:", e);
        setError("WebSocket connection error");
        setConnectionState("error");
      };

      ws.current.onclose = () => {
        console.log("WebSocket connection closed");
        setConnectionState((prev) => (prev === "completed" ? "completed" : "disconnected"));
      };
    } catch (e) {
      console.error("Failed to create WebSocket connection:", e);
      setError("Failed to create WebSocket connection");
      setConnectionState("error");
    }
  }, [encounterId, onTerminate]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setConnectionState("disconnected");
    }
  }, []);

  const sendResponse = useCallback((response: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ text: response, response }));
    }
  }, []);

  const sendTextWS = useCallback((text: string) => {
    sendResponse(text);
  }, [sendResponse]);

  const addAssistantMessage = useCallback((text: string) => {
    setTranscript((prev) => [
      ...prev,
      { role: "assistant", text, content: text, timestamp: new Date().toISOString() },
    ]);
  }, []);

  const addPatientMessage = useCallback((text: string) => {
    setTranscript((prev) => [
      ...prev,
      { role: "patient", text, content: text, timestamp: new Date().toISOString() },
    ]);
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
