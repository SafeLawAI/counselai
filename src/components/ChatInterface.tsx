"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

function createThread(): Thread {
  return {
    id: uuidv4(),
    title: "New session",
    messages: [],
    createdAt: new Date(),
  };
}

export default function ChatInterface() {
  const [threads, setThreads] = useState<Thread[]>(() => [createThread()]);
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    const t = createThread();
    return t.id;
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];

  // Initialize with a single thread on mount
  useEffect(() => {
    const initial = createThread();
    setThreads([initial]);
    setActiveThreadId(initial.id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }, [input]);

  function newThread() {
    const thread = createThread();
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    setInput("");
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  function switchThread(id: string) {
    setActiveThreadId(id);
    setInput("");
  }

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: trimmed,
    };

    // Update thread with user message and auto-title if first message
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        const isFirst = t.messages.length === 0;
        return {
          ...t,
          title: isFirst ? trimmed.slice(0, 50) + (trimmed.length > 50 ? "…" : "") : t.title,
          messages: [...t.messages, userMessage],
        };
      })
    );

    setInput("");
    setIsStreaming(true);

    const allMessages = [
      ...(activeThread?.messages ?? []),
      userMessage,
    ].map(({ role, content }) => ({ role, content }));

    const assistantMessageId = uuidv4();

    // Add empty assistant message immediately
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        return {
          ...t,
          messages: [
            ...t.messages,
            { id: assistantMessageId, role: "assistant" as const, content: "" },
          ],
        };
      })
    );

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          sessionId: activeThreadId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== activeThreadId) return t;
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === assistantMessageId ? { ...m, content: accumulated } : m
              ),
            };
          })
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;

      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred.";

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeThreadId) return t;
          return {
            ...t,
            messages: t.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: `I encountered an error: ${errorMsg} Please try again.`,
                  }
                : m
            ),
          };
        })
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [input, isStreaming, activeThreadId, activeThread?.messages]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const messages = activeThread?.messages ?? [];

  return (
    <div className="flex h-full bg-slate-950">
      {/* Thread sidebar */}
      <div className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/50 shrink-0">
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={newThread}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
          >
            <PlusIcon />
            New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => switchThread(thread.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${
                thread.id === activeThreadId
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span className="block truncate">{thread.title}</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {thread.messages.length} message{thread.messages.length !== 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Privacy banner */}
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2">
          <LockIcon />
          <p className="text-xs text-slate-400">
            This session is private and not stored. Closing this window ends the session permanently.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isStreaming && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-slate-800 bg-slate-900/50 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-brand-600/60 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about case law, draft a motion, analyze a contract…"
                className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed min-h-[24px]"
                rows={1}
                disabled={isStreaming}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isStreaming ? <StopIcon /> : <SendIcon />}
              </button>
            </div>
            <p className="text-center text-xs text-slate-600 mt-2">
              AI can make mistakes. Always verify citations independently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-brand-400 text-xs font-semibold">L</span>
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-brand-600 text-white"
            : "bg-slate-800 text-slate-100 border border-slate-700"
        }`}
      >
        <MessageContent content={message.content} isAssistant={!isUser} />
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-slate-300 text-xs font-semibold">A</span>
        </div>
      )}
    </div>
  );
}

function MessageContent({ content, isAssistant }: { content: string; isAssistant: boolean }) {
  if (!isAssistant) return <p className="whitespace-pre-wrap">{content}</p>;

  // Render assistant messages with basic markdown-like formatting
  const lines = content.split("\n");

  return (
    <div className="prose-sm prose-invert max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) {
          return <p key={i} className="font-semibold text-white text-base mt-3 mb-1">{line.slice(4)}</p>;
        }
        if (line.startsWith("## ")) {
          return <p key={i} className="font-bold text-white text-base mt-4 mb-1">{line.slice(3)}</p>;
        }
        if (line.startsWith("# ")) {
          return <p key={i} className="font-bold text-white text-lg mt-4 mb-2">{line.slice(2)}</p>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <p key={i} className="pl-4 before:content-['•'] before:mr-2 before:text-brand-400">{line.slice(2)}</p>;
        }
        if (/^\d+\. /.test(line)) {
          return <p key={i} className="pl-4">{line}</p>;
        }
        if (line === "") {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInlineCode(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="bg-slate-700 text-brand-300 px-1 py-0.5 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
        <span className="text-brand-400 text-xs font-semibold">L</span>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const suggestions = [
    "Research the elements of promissory estoppel in New York",
    "Draft a non-disclosure agreement for a software consulting engagement",
    "Analyze the implied duty of good faith in commercial contracts",
    "Summarize recent circuit court splits on arbitration clauses",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mb-4">
        <span className="text-brand-400 text-xl font-bold">L</span>
      </div>
      <h2 className="text-white font-semibold text-xl mb-2">LexSafe AI</h2>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        Your private legal research assistant. Sessions are never recorded or stored.
        Ask anything — research, drafting, strategy, or document analysis.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {suggestions.map((s) => (
          <SuggestionCard key={s} text={s} />
        ))}
      </div>
    </div>
  );
}

function SuggestionCard({ text }: { text: string }) {
  return (
    <div className="text-left px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 text-sm hover:border-brand-600/40 hover:text-slate-300 transition-colors cursor-default">
      {text}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-brand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
