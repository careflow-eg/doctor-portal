"use client";

import { useState, useRef, useEffect } from "react";
import { useHistoryWebSocket } from "@/hooks/useHistoryWebSocket";
import { historyService } from "@/services/historyService";
import { useNotificationStore } from "@/stores/notificationStore";
import { TranscriptTimeline } from "./TranscriptTimeline";
import { Bot, Wifi, WifiOff, Loader2, Send, Mic, MicOff, CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  const {
    connectionState,
    currentQuestion,
    setCurrentQuestion,
    transcript,
    error,
    connect,
    disconnect,
    sendTextWS,
    addAssistantMessage,
    addPatientMessage,
  } = useHistoryWebSocket({ encounterId });

  // Auto-scroll transcript
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const data = await historyService.startHistorySession(encounterId);
      setSessionStarted(true);

      // Prioritize Arabic initial question from backend
      const initialQuestion =
        (data as Record<string, string>).initial_question_arabic ||
        (data as Record<string, string>).initial_question_english ||
        (data as Record<string, string>).question ||
        (data as Record<string, string>).message ||
        "أهلاً بك. ايه العرض أو المشكلة الطبية اللي بتعاني منها النهاردة؟";

      setCurrentQuestion(initialQuestion);
      addAssistantMessage(initialQuestion);

      connect();
      addNotification({
        type: "success",
        title: "History session started",
        message: "AI interviewer is ready.",
      });
    } catch {
      addNotification({ type: "error", title: "Failed to start history session" });
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendText = async () => {
    const userText = text.trim();
    if (!userText || isSending) return;

    setText("");
    setIsSending(true);

    // Add patient turn to UI
    addPatientMessage(userText);

    // If WebSocket is connected, send via WebSocket stream (WS onmessage handles AI response)
    if (connectionState === "connected") {
      sendTextWS(userText);
      setIsSending(false);
      return;
    }

    // Otherwise, fallback to REST turn API
    try {
      const data = await historyService.processTextTurn(encounterId, userText);

      // Prioritize Arabic next question from backend
      const nextQuestion =
        (data as Record<string, string>).next_question_arabic ||
        (data as Record<string, string>).next_question_english ||
        (data as Record<string, string>).next_question ||
        (data as Record<string, string>).question ||
        (data as Record<string, string>).message;

      if (nextQuestion) {
        addAssistantMessage(nextQuestion);
      }
    } catch {
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
          const blob = new Blob(audioChunks.current, { type: "audio/wav" });
          stream.getTracks().forEach((t) => t.stop());
          try {
            const data = await historyService.processAudioTurn(encounterId, blob);
            addNotification({ type: "info", title: "Audio response sent" });

            const nextQuestion =
              (data as Record<string, string>).next_question_arabic ||
              (data as Record<string, string>).next_question_english ||
              (data as Record<string, string>).next_question;

            if (nextQuestion) {
              addAssistantMessage(nextQuestion);
            }
          } catch {
            addNotification({ type: "error", title: "Audio upload failed" });
          }
        };

        recorder.start();
        mediaRecorder.current = recorder;
        setIsRecording(true);
      } catch {
        addNotification({ type: "error", title: "Microphone access denied" });
      }
    }
  };

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

  const statusColors = {
    disconnected: "text-muted-foreground",
    connecting: "text-amber-500",
    connected: "text-emerald-500",
    error: "text-amber-500",
    completed: "text-careflow-teal",
  };

  const statusLabels = {
    disconnected: "REST Mode",
    connecting: "Connecting...",
    connected: "Real-time Live",
    error: "REST Fallback",
    completed: "Interview complete",
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
          ) : connectionState !== "completed" ? (
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
          ) : null}
        </div>
      </div>

      {/* Current question banner */}
      <AnimatePresence>
        {currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl border border-careflow-teal/30 bg-careflow-teal/5 px-5 py-4"
          >
            <p className="text-xs font-semibold text-careflow-teal mb-1 uppercase tracking-wider">سؤال الذكاء الاصطناعي</p>
            <p className="text-sm font-semibold text-foreground font-sans">{currentQuestion}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          Note: {error}
        </div>
      )}

      {/* Transcript */}
      <div className="flex-1 glass-card rounded-2xl border border-border p-5 overflow-y-auto">
        <TranscriptTimeline entries={transcript} />
        <div ref={transcriptBottomRef} />
      </div>

      {/* Input area */}
      {sessionStarted && connectionState !== "completed" && (
        <div className="glass-card rounded-2xl border border-border p-4 flex items-center gap-3">
          <button
            onClick={handleVoiceToggle}
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
            title={isRecording ? "Stop recording" : "Record voice"}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendText()}
            placeholder="اكتب إجابة المريض أو استخدم الصوت..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none text-right"
            dir="auto"
            disabled={isSending}
          />

          <button
            onClick={handleSendText}
            disabled={!text.trim() || isSending}
            className="h-10 w-10 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
