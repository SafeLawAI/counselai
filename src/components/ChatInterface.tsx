"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { UserRole } from "@/lib/database.types";

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
  return { id: uuidv4(), title: "New session", messages: [], createdAt: new Date() };
}

interface Props {
  userRole: UserRole;
}

export default function ChatInterface({ userRole }: Props) {
  const [threads, setThreads] = useState<Thread[]>(() => {
    const t = createThread();
    return [t];
  });
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    return createThread().id;
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];

  useEffect(() => {
    const t = createThread();
    setThreads([t]);
    setActiveThreadId(t.id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [input]);

  function newThread() {
    const t = createThread();
    setThreads((prev) => [t, ...prev]);
    setActiveThreadId(t.id);
    setInput("");
    setPanelOpen(false);
    abortControllerRef.current?.abort();
  }

  function switchThread(id: string) {
    setActiveThreadId(id);
    setInput("");
    setPanelOpen(false);
  }

  const sendMessage = useCallback(async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = { id: uuidv4(), role: "user", content: trimmed };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        const isFirst = t.messages.length === 0;
        return {
          ...t,
          title: isFirst ? trimmed.slice(0, 50) + (trimmed.length > 50 ? "…" : "") : t.title,
          messages: [...t.messages, userMsg],
        };
      })
    );

    setInput("");
    setIsStreaming(true);

    const history = [...(activeThread?.messages ?? []), userMsg].map(({ role, content }) => ({ role, content }));
    const assistantId = uuidv4();

    setThreads((prev) =>
      prev.map((t) =>
        t.id !== activeThreadId
          ? t
          : { ...t, messages: [...t.messages, { id: assistantId, role: "assistant" as const, content: "" }] }
      )
    );

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, sessionId: activeThreadId }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setThreads((prev) =>
          prev.map((t) =>
            t.id !== activeThreadId
              ? t
              : { ...t, messages: t.messages.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)) }
          )
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setThreads((prev) =>
        prev.map((t) =>
          t.id !== activeThreadId
            ? t
            : { ...t, messages: t.messages.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${msg} Please try again.` } : m)) }
        )
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
    <div className="h-full bg-slate-950 flex flex-col relative">

      {/* ── Panel overlay ── */}
      {panelOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 h-full w-72 z-50 bg-[#1a1a1a] flex flex-col transform transition-transform duration-200 ease-in-out ${panelOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <span className="text-white font-semibold"><span className="text-brand-400">Lex</span>Safe AI</span>
          <button onClick={() => setPanelOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* New session button */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={newThread}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white text-sm transition-colors"
          >
            <PlusIcon />
            New session
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 space-y-0.5">
          {threads.length > 0 && (
            <p className="text-xs text-slate-500 uppercase tracking-wider px-3 py-2">Sessions</p>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => switchThread(t.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                t.id === activeThreadId
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="block truncate">{t.title}</span>
            </button>
          ))}
        </div>

        {/* Divider + nav */}
        <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
          <p className="text-xs text-slate-500 uppercase tracking-wider px-3 py-2">Account</p>
          {userRole === "admin" && (
            <>
              <PanelLink href="/dashboard/firm" onClick={() => setPanelOpen(false)} icon={<FirmIcon />} label="Firm Settings" />
              <PanelLink href="/dashboard/firm/users" onClick={() => setPanelOpen(false)} icon={<UsersIcon />} label="Manage Users" />
            </>
          )}
          <PanelLink href="/dashboard/settings" onClick={() => setPanelOpen(false)} icon={<SettingsIcon />} label="Settings" />
        </div>

        {/* Privacy + user */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-start gap-2 text-xs text-slate-500 mb-3 leading-snug">
            <LockIcon />
            <span>Sessions are never stored. Closing ends the session permanently. <Link href="/privacy" className="text-brand-400 hover:underline" onClick={() => setPanelOpen(false)}>Learn more</Link></span>
          </div>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-slate-400 capitalize">{userRole}</span>
          </div>
        </div>
      </div>

      {/* ── Floating panel button — left-center ── */}
      <button
        onClick={() => setPanelOpen(true)}
        className="fixed left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {/* ── Chat area ── */}
      {messages.length === 0 ? (
        <EmptyState onSend={sendMessage} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
              {messages.map((m) => <MessageRow key={m.id} message={m} />)}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-4 pb-4 pt-2">
            <div className="max-w-3xl mx-auto">
              <InputBox ref={textareaRef} value={input} onChange={setInput} onKeyDown={handleKeyDown} onSend={() => sendMessage()} isStreaming={isStreaming} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Panel nav link ────────────────────────────────────────────
function PanelLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}

// ── Messages ─────────────────────────────────────────────────
function MessageRow({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-[#2f2f2f] text-slate-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
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
        {message.content ? (
          <MessageContent content={message.content} />
        ) : (
          <div className="pt-2 flex gap-1">
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
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
        li: ({ children }) => <li className="leading-7 pl-1 text-slate-300">{children}</li>,
        code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
          inline ? (
            <code className="bg-white/10 text-brand-300 px-1.5 py-0.5 rounded-md text-[13px] font-mono">{children}</code>
          ) : (
            <code className="block bg-[#1a1a1a] border border-white/10 text-slate-300 p-4 rounded-xl text-[13px] font-mono overflow-x-auto my-4 whitespace-pre leading-6">{children}</code>
          ),
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => <blockquote className="border-l-[3px] border-brand-600/60 pl-4 my-4 text-slate-400 italic">{children}</blockquote>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
        hr: () => <hr className="border-white/10 my-5" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="border-b border-white/10 bg-white/5 px-4 py-2.5 text-left font-semibold text-white text-xs uppercase tracking-wider">{children}</th>,
        td: ({ children }) => <td className="border-b border-white/5 px-4 py-2.5 text-slate-300">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}


// ── Empty state ───────────────────────────────────────────────
function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [val]);

  const suggestions = [
    "Research the elements of promissory estoppel in New York",
    "Draft a non-disclosure agreement for a software consulting engagement",
    "Analyze the implied duty of good faith in commercial contracts",
    "Summarize recent circuit court splits on arbitration clauses",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">L</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">LexSafe AI</h1>
          <p className="text-slate-500 text-sm">Your private legal research assistant</p>
        </div>

        <div className="mb-5">
          <InputBox
            ref={ref}
            value={val}
            onChange={setVal}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (val.trim()) onSend(val.trim()); } }}
            onSend={() => { if (val.trim()) onSend(val.trim()); }}
            isStreaming={false}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => onSend(s)} className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 hover:text-slate-200 hover:border-white/20 transition-all leading-snug">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Input box ─────────────────────────────────────────────────
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
  <div className="relative bg-[#2f2f2f] rounded-2xl shadow-lg border border-white/10 focus-within:border-white/20 transition-colors">
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
      <span className="text-xs text-slate-600 hidden sm:block">Enter to send</span>
      <button
        onClick={onSend}
        disabled={!value.trim() || isStreaming}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        {isStreaming ? <StopIcon /> : <SendIcon />}
      </button>
    </div>
  </div>
);

// ── Icons ─────────────────────────────────────────────────────
function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
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
    <svg className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
function FirmIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
