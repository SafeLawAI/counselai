"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [activeThreadId, setActiveThreadId] = useState<string>(() => threads[0].id);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];

  useEffect(() => {
    const initial = createThread();
    setThreads([initial]);
    setActiveThreadId(initial.id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 240) + "px";
  }, [input]);

  function newThread() {
    const thread = createThread();
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    setInput("");
    abortControllerRef.current?.abort();
  }

  function switchThread(id: string) {
    setActiveThreadId(id);
    setInput("");
  }

  const sendMessage = useCallback(async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isStreaming) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: trimmed,
    };

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
        body: JSON.stringify({ messages: allMessages, sessionId: activeThreadId }),
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
        accumulated += decoder.decode(value, { stream: true });

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
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeThreadId) return t;
          return {
            ...t,
            messages: t.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: `Sorry, I encountered an error: ${errorMsg} Please try again.` }
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
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3">
          <button
            onClick={newThread}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition-colors border border-slate-700 hover:border-slate-600"
          >
            <PlusIcon />
            New session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => switchThread(thread.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                thread.id === activeThreadId
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="block truncate">{thread.title}</span>
            </button>
          ))}
        </div>

        {/* Privacy notice at bottom of sidebar */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-start gap-2 text-xs text-slate-500 leading-snug">
            <LockIcon />
            <span>Sessions are never stored. Closing ends the session permanently.</span>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {messages.length === 0 ? (
          <EmptyState onSend={sendMessage} />
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {messages.map((message) => (
                  <MessageRow key={message.id} message={message} />
                ))}
                {isStreaming &&
                  messages[messages.length - 1]?.role === "assistant" &&
                  messages[messages.length - 1]?.content === "" && (
                    <TypingIndicator />
                  )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4">
              <div className="max-w-3xl mx-auto">
                <InputBox
                  ref={textareaRef}
                  value={input}
                  onChange={setInput}
                  onKeyDown={handleKeyDown}
                  onSend={() => sendMessage()}
                  isStreaming={isStreaming}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-slate-800 text-slate-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">L</span>
      </div>
      <div className="flex-1 min-w-0 text-slate-100 text-sm leading-relaxed pt-1">
        {message.content === "" ? null : (
          <MessageContent content={message.content} />
        )}
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-5 mb-2 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold text-white mt-5 mb-2 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold text-white mt-4 mb-1 first:mt-0">{children}</h3>,
        p: ({ children }) => <p className="mb-4 last:mb-0 leading-7">{children}</p>,
        ul: ({ children }) => <ul className="mb-4 space-y-1.5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 space-y-1.5 list-decimal list-outside pl-5">{children}</ol>,
        li: ({ children }) => (
          <li className="leading-7 pl-1">
            <span className="text-slate-300">{children}</span>
          </li>
        ),
        code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
          inline ? (
            <code className="bg-slate-700/80 text-brand-300 px-1.5 py-0.5 rounded-md text-[13px] font-mono">
              {children}
            </code>
          ) : (
            <code className="block bg-slate-900 border border-slate-700/60 text-slate-300 p-4 rounded-xl text-[13px] font-mono overflow-x-auto my-4 whitespace-pre leading-6">
              {children}
            </code>
          ),
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-[3px] border-brand-600/60 pl-4 my-4 text-slate-400 italic">
            {children}
          </blockquote>
        ),
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
        hr: () => <hr className="border-slate-700/60 my-5" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-xl border border-slate-700/60">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-slate-700 bg-slate-800/80 px-4 py-2.5 text-left font-semibold text-white text-xs uppercase tracking-wider">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-slate-800 px-4 py-2.5 text-slate-300">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">L</span>
      </div>
      <div className="pt-2.5">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 240) + "px";
  }, [input]);

  const suggestions = [
    "Research the elements of promissory estoppel in New York",
    "Draft a non-disclosure agreement for a software consulting engagement",
    "Analyze the implied duty of good faith in commercial contracts",
    "Summarize recent circuit court splits on arbitration clauses",
  ];

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) onSend(input.trim());
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">L</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">LexSafe AI</h1>
          <p className="text-slate-400 text-sm">Your private legal research assistant</p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <InputBox
            ref={textareaRef}
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            onSend={() => { if (input.trim()) onSend(input.trim()); }}
            isStreaming={false}
            autoFocus
          />
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              className="text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600 transition-all leading-snug"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const InputBox = ({
  ref,
  value,
  onChange,
  onKeyDown,
  onSend,
  isStreaming,
  autoFocus,
}: {
  ref: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  isStreaming: boolean;
  autoFocus?: boolean;
}) => (
  <div className="relative bg-slate-800 border border-slate-700 rounded-2xl focus-within:border-slate-500 transition-colors shadow-lg">
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder="Ask about case law, draft a motion, analyze a contract…"
      className="w-full bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed px-4 pt-4 pb-12 min-h-[56px]"
      rows={1}
      disabled={isStreaming}
      autoFocus={autoFocus}
    />
    <div className="absolute bottom-3 right-3 flex items-center gap-2">
      <span className="text-xs text-slate-600 hidden sm:block">
        {isStreaming ? "" : "Enter to send · Shift+Enter for newline"}
      </span>
      <button
        onClick={onSend}
        disabled={!value.trim() || isStreaming}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {isStreaming ? <StopIcon /> : <SendIcon />}
      </button>
    </div>
  </div>
);

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
    <svg className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
