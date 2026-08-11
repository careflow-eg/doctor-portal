"use client";

import { useState, useRef, useEffect } from "react";
import { useHistoryWebSocket } from "@/hooks/useHistoryWebSocket";
import { historyService } from "@/services/historyService";
import { useNotificationStore } from "@/stores/notificationStore";
import { TranscriptTimeline } from "./TranscriptTimeline";
import { Bot, Wifi, WifiOff, Loader2, Send, Mic, MicOff, CheckCircle, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryCollectionProps {
  encounterId: string;
  onComplete?: () => void;
}

export function HistoryCollection({ encounterId, onComplete }: HistoryCollectionProps) {
  const { addNotification } = useNotificationStore();
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await historyService.finishHistorySession(encounterId);
      disconnect();
      addNotification({ type: "success", title: "History collection complete!" });
      onComplete?.();
    } catch {
      addNotification({ type: "error", title: "Failed to finish session" });
    } finally {
      setIsFinishing(false);
    }
  };

  const {
    connectionState,
    setCurrentQuestion,
    transcript,
    connect,
    disconnect,
    sendTextWS,
    addAssistantMessage,
    addPatientMessage,
  } = useHistoryWebSocket({
    encounterId,
    autoConnect: true,
    onTerminate: () => {
      addNotification({ type: "success", title: "History collection complete!" });
      onComplete?.();
    },
  });

  const isInterviewFinished = connectionState === "completed";

  // Auto-scroll transcript to latest message
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      connect();
      setSessionStarted(true);

      const data = await historyService.startHistorySession(encounterId);

      const isTerminated = Boolean(
        data?.should_continue === false ||
        data?.should_terminate === true ||
        (data?.data as Record<string, unknown>)?.should_continue === false ||
        (data?.data as Record<string, unknown>)?.should_terminate === true ||
        data?.is_completed === true ||
        data?.status === "COMPLETED"
      );

      if (isTerminated) {
        const completionMsg =
          (data as Record<string, string>)?.next_question_arabic ||
          (data as Record<string, string>)?.next_question_english ||
          (data as Record<string, string>)?.message ||
          "تم الانتهاء من تجميع التاريخ الطبي بنجاح.";

        setCurrentQuestion(completionMsg);
        addAssistantMessage(completionMsg);
        await handleFinish();
        return;
      }

      const initialQuestion =
        (data as Record<string, string>).initial_question_arabic ||
        (data as Record<string, string>).initial_question_english ||
        (data as Record<string, string>).question ||
        (data as Record<string, string>).message;

      if (initialQuestion) {
        setCurrentQuestion(initialQuestion);
        addAssistantMessage(initialQuestion);
      }

      addNotification({
        type: "success",
        title: "History session started",
        message: "AI interviewer is ready via WebSocket.",
      });
    } catch (err) {
      console.warn("REST start session failed, continuing on WebSocket stream:", err);
      setSessionStarted(true);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendText = async () => {
    const userText = text.trim();
    if (!userText || isSending || isInterviewFinished) return;

    setText("");
    setIsSending(true);

    // 1. Add patient turn to UI timeline
    addPatientMessage(userText);

    // 2. Primary: Send via real-time WebSocket stream (useHistoryWebSocket evaluates should_continue)
    if (connectionState === "connected") {
      sendTextWS(userText);
      setIsSending(false);
      return;
    }

    // 3. Fallback: REST API
    try {
      const data = await historyService.processTextTurn(encounterId, userText);

      const isTerminated = Boolean(
        data?.should_continue === false ||
        data?.should_terminate === true ||
        (data?.data as Record<string, unknown>)?.should_continue === false ||
        (data?.data as Record<string, unknown>)?.should_terminate === true ||
        data?.is_completed === true ||
        data?.status === "COMPLETED"
      );

      if (isTerminated) {
        const completionMsg =
          (data as Record<string, string>)?.next_question_arabic ||
          (data as Record<string, string>)?.next_question_english ||
          (data as Record<string, string>)?.message ||
          "تم الانتهاء من تجميع التاريخ الطبي بنجاح.";

        setCurrentQuestion(completionMsg);
        addAssistantMessage(completionMsg);
        await handleFinish();
        return;
      }

      const nextQuestion =
        (data as Record<string, string>).next_question_arabic ||
        (data as Record<string, string>).next_question_english ||
        (data as Record<string, string>).next_question ||
        (data as Record<string, string>).question ||
        (data as Record<string, string>).message;

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        addAssistantMessage(nextQuestion);
      }
    } catch (err) {
      console.error("Error processing text turn:", err);
      addNotification({
        type: "error",
        title: "Error processing turn",
        message: "Could not send response to AI.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isInterviewFinished) return;

    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunks.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.current.push(e.data);
        };

        recorder.onstop = async () => {
          const mimeType = recorder.mimeType || "audio/webm";
          const blob = new Blob(audioChunks.current, { type: mimeType });
          const filename = mimeType.includes("webm")
            ? "audio.webm"
            : mimeType.includes("mp4")
            ? "audio.mp4"
            : mimeType.includes("ogg")
            ? "audio.ogg"
            : "audio.wav";

          stream.getTracks().forEach((t) => t.stop());
          try {
            const data = await historyService.processAudioTurn(encounterId, blob, filename);
            addNotification({ type: "info", title: "Audio response processed" });

            const isTerminated = Boolean(
              data?.should_continue === false ||
              data?.should_terminate === true ||
              (data?.data as Record<string, unknown>)?.should_continue === false ||
              (data?.data as Record<string, unknown>)?.should_terminate === true ||
              data?.is_completed === true ||
              data?.status === "COMPLETED"
            );

            if (isTerminated) {
              const completionMsg =
                (data as Record<string, string>)?.next_question_arabic ||
                (data as Record<string, string>)?.next_question_english ||
                (data as Record<string, string>)?.message ||
                "تم الانتهاء من تجميع التاريخ الطبي بنجاح.";

              setCurrentQuestion(completionMsg);
              addAssistantMessage(completionMsg);
              await handleFinish();
              return;
            }

            const nextQuestion =
              (data as Record<string, string>).next_question_arabic ||
              (data as Record<string, string>).next_question_english ||
              (data as Record<string, string>).next_question;

            if (nextQuestion) {
              setCurrentQuestion(nextQuestion);
              addAssistantMessage(nextQuestion);
            }
          } catch {
            addNotification({ type: "error", title: "Audio upload failed" });
          }
        };

        recorder.start();
        mediaRecorder.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access error:", err);
        addNotification({
          type: "error",
          title: "Microphone access denied",
          message: err instanceof Error ? err.message : "Unable to access microphone",
        });
      }
    }
  };

  const statusColors = {
    disconnected: "text-muted-foreground",
    connecting: "text-amber-500",
    connected: "text-emerald-500",
    error: "text-amber-500",
    completed: "text-careflow-teal",
  };

  const statusLabels = {
    disconnected: "WebSocket Ready",
    connecting: "Connecting WS...",
    connected: "WebSocket Connected",
    error: "WebSocket Error",
    completed: "Interview Finished & Saved",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto gap-4">
      {/* Header */}
      <div className="glass-card rounded-2xl border border-border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-careflow-teal/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-careflow-teal" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI History Collection</h2>
            <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusColors[connectionState])}>
              {connectionState === "connected" ? (
                <Wifi className="h-3 w-3" />
              ) : connectionState === "completed" ? (
                <Lock className="h-3 w-3 text-careflow-teal" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {statusLabels[connectionState]}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!sessionStarted ? (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="flex items-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white px-4 py-2 text-sm font-medium transition-all disabled:opacity-60 shadow-md"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start Interview
            </button>
          ) : !isInterviewFinished ? (
            <button
              onClick={handleFinish}
              disabled={isFinishing}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium transition-all disabled:opacity-60 shadow-md"
            >
              {isFinishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Finish Interview
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
              <CheckCircle className="h-4 w-4" />
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Transcript Timeline */}
      <div className="flex-1 glass-card rounded-2xl border border-border overflow-hidden flex flex-col p-4 overflow-y-auto">
        <TranscriptTimeline entries={transcript} />
        <div ref={transcriptBottomRef} />
      </div>

      {/* Input controls (DISABLED when interview is finished) */}
      <div className={cn("glass-card rounded-2xl border border-border p-3 flex items-center gap-2", isInterviewFinished && "opacity-60 bg-muted/20")}>
        <button
          onClick={handleVoiceToggle}
          disabled={isInterviewFinished}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-all shrink-0",
            isInterviewFinished
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : isRecording
              ? "bg-destructive text-white animate-pulse"
              : "bg-muted hover:bg-muted/80 text-foreground"
          )}
          title={isInterviewFinished ? "Interview complete" : isRecording ? "Stop recording" : "Record voice response"}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendText();
            }
          }}
          disabled={isInterviewFinished}
          placeholder={isInterviewFinished ? "Interview completed — inputs disabled" : "Type patient response..."}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />

        <button
          onClick={handleSendText}
          disabled={!text.trim() || isSending || isInterviewFinished}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-careflow-teal text-white hover:bg-careflow-teal-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
