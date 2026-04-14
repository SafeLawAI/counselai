"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const PRACTICE_AREAS = [
  "Corporate & Business Law",
  "Litigation & Dispute Resolution",
  "Real Estate",
  "Family Law",
  "Criminal Defense",
  "Immigration",
  "Intellectual Property",
  "Employment & Labor",
  "Tax Law",
  "Estate Planning & Probate",
  "Personal Injury",
  "Other",
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();

  const [firmName, setFirmName] = useState("");
  const [firmSize, setFirmSize] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firmName.trim()) {
      setError("Firm name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmName: firmName.trim(), firmSize, practiceArea }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create firm.");
      }

      router.push("/dashboard/chat");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2 text-white text-2xl font-semibold mb-6">
            <span className="text-brand-400">Lex</span>Safe AI
          </a>
          <h1 className="text-2xl font-semibold text-white">Set up your firm</h1>
          <p className="text-slate-400 mt-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}. Tell us about your practice.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Firm or Practice Name <span className="text-brand-400">*</span>
            </label>
            <input
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="Smith & Associates"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Firm Size
            </label>
            <select
              value={firmSize}
              onChange={(e) => setFirmSize(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="">Select size (optional)</option>
              <option value="solo">Solo practitioner</option>
              <option value="2-5">2–5 attorneys</option>
              <option value="6-20">6–20 attorneys</option>
              <option value="21-50">21–50 attorneys</option>
              <option value="50+">50+ attorneys</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Primary Practice Area
            </label>
            <select
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="">Select area (optional)</option>
              {PRACTICE_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? "Setting up your workspace..." : "Continue to LexSafe AI"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Your 14-day free trial starts now. No credit card required.
          </p>
        </form>
      </div>
    </div>
  );
}
