import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";

export default async function FirmSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("role, firm_id")
    .eq("clerk_id", userId)
    .single();

  if (!user || user.role !== "admin") {
    redirect("/dashboard/chat");
  }

  const { data: firm } = await supabaseAdmin
    .from("firms")
    .select("*")
    .eq("id", user.firm_id)
    .single();

  const { count: userCount } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("firm_id", user.firm_id);

  const tierLabels: Record<string, string> = {
    trial: "14-Day Trial",
    basic: "Solo ($79/mo)",
    professional: "Professional ($499/mo)",
    enterprise: "Enterprise",
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-1">Firm Settings</h1>
        <p className="text-slate-400 mb-8">Manage your firm&apos;s account and users.</p>

        {firm && (
          <div className="space-y-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
                Firm Overview
              </h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Firm Name</dt>
                  <dd className="text-white font-medium">{firm.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Plan</dt>
                  <dd className="text-white font-medium capitalize">
                    {tierLabels[firm.subscription_tier] ?? firm.subscription_tier}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Status</dt>
                  <dd>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      firm.subscription_status === "active"
                        ? "bg-green-900/30 text-green-400 border border-green-800/50"
                        : "bg-red-900/30 text-red-400 border border-red-800/50"
                    }`}>
                      {firm.subscription_status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Users</dt>
                  <dd className="text-white font-medium">
                    {userCount ?? 0} / {firm.max_users}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/firm/users"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Manage Users
                </Link>
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700"
                >
                  Upgrade Plan
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
