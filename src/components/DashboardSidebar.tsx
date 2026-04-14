"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { UserRole } from "@/lib/database.types";

interface Props {
  userRole: UserRole;
}

export default function DashboardSidebar({ userRole }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(path + "/");
  }

  return (
    <>
      {/* Toggle button — always visible top-left */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-40 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <Link
            href="/dashboard/chat"
            onClick={() => setOpen(false)}
            className="text-white font-semibold text-lg"
          >
            <span className="text-brand-400">Lex</span>Safe AI
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem
            href="/dashboard/chat"
            label="New Session"
            icon={<ChatIcon />}
            active={isActive("/dashboard/chat")}
            onClick={() => setOpen(false)}
          />

          {userRole === "admin" && (
            <>
              <div className="pt-5 pb-1 px-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Firm Admin
                </p>
              </div>
              <NavItem
                href="/dashboard/firm"
                label="Firm Settings"
                icon={<FirmIcon />}
                active={isActive("/dashboard/firm")}
                onClick={() => setOpen(false)}
              />
              <NavItem
                href="/dashboard/firm/users"
                label="Manage Users"
                icon={<UsersIcon />}
                active={isActive("/dashboard/firm/users")}
                onClick={() => setOpen(false)}
              />
            </>
          )}

          <div className="pt-5 pb-1 px-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Account
            </p>
          </div>
          <NavItem
            href="/dashboard/settings"
            label="Settings"
            icon={<SettingsIcon />}
            active={isActive("/dashboard/settings")}
            onClick={() => setOpen(false)}
          />
        </nav>

        {/* Privacy notice */}
        <div className="px-4 py-3 mx-3 mb-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <LockIcon />
            <span className="text-xs font-medium text-slate-300">Privacy Protected</span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Sessions are never stored. Closing a window ends the session permanently.
          </p>
          <Link
            href="/privacy"
            onClick={() => setOpen(false)}
            className="text-xs text-brand-400 hover:text-brand-300 mt-1 inline-block transition-colors"
          >
            How it works →
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-slate-300 capitalize">{userRole}</span>
        </div>
      </div>
    </>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-brand-600/20 text-brand-300 border border-brand-600/30"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}

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

function ChatIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

function LockIcon() {
  return (
    <svg className="w-3 h-3 text-brand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
