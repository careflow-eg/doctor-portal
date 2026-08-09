"use client";

import { useState, useRef, useEffect } from "react";
import { assistantService } from "@/services/assistantService";
import { AssistantMessage } from "@/types/dashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useNotificationStore } from "@/stores/notificationStore";
import { Bot, User, Send, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { formatTime } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STARTER_QUESTIONS = [
  "What are the most likely diagnoses based on the clinical data?",
  "What additional tests should I order?",
  "Are there any drug interactions I should be aware of?",
  "What is the recommended treatment approach?",
  "Are there any red flags I should watch for?",
];

export function AssistantClient({ id }: { id: string }) {
  const { addNotification } = useNotificationStore();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const priorTurns = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await assistantService.queryAssistant(id, query, priorTurns);
      const assistantMsg: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer ?? response.response ?? "I couldn't generate a response. Please try again.",
        citations: response.citations ?? response.sources,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      addNotification({
        type: "error",
        title: "Assistant error",
        message: "Failed to get response. Ensure the dashboard has been generated.",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto gap-4 animate-fade-in">
      {/* Navigation */}
      <Link
        href={`/encounters/${id}/dashboard`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <PageHeader
        title="AI Physician Assistant"
        subtitle="Ask clinical questions about this encounter"
        badge={
          <span className="text-xs bg-careflow-teal/10 text-careflow-teal px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            AI Powered
          </span>
        }
      />

      {/* Conversation */}
      <div className="flex-1 glass-card rounded-2xl border border-border overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="h-16 w-16 rounded-2xl bg-careflow-teal/10 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-careflow-teal" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">AI Physician Assistant</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Ask me anything about this patient&apos;s clinical data, diagnoses, or treatment options.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-sm text-left rounded-xl border border-border bg-muted/30 hover:bg-muted px-4 py-2.5 text-foreground transition-all hover:border-careflow-teal/40"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-start gap-3",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                      msg.role === "user"
                        ? "bg-careflow-blue/10"
                        : "bg-careflow-teal/10"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User className="h-5 w-5 text-careflow-blue" />
                    ) : (
                      <Bot className="h-5 w-5 text-careflow-teal" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={cn("max-w-[80%]", msg.role === "user" && "items-end flex flex-col")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm",
                        msg.role === "user"
                          ? "bg-careflow-teal text-white rounded-tr-sm"
                          : "bg-muted/50 text-foreground rounded-tl-sm border border-border"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-[10px] font-medium opacity-70 mb-1">Sources</p>
                          {msg.citations.map((c, i) => {
                            const text = typeof c === "string" ? c : `[${c.source_type || "Source"}] ${c.content_snippet || ""}`;
                            return (
                              <p key={i} className="text-[11px] opacity-60 line-clamp-1">{text}</p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-xl bg-careflow-teal/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-careflow-teal" />
                </div>
                <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full bg-careflow-teal/60 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="glass-card rounded-2xl border border-border p-4 flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a clinical question..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="h-10 w-10 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
