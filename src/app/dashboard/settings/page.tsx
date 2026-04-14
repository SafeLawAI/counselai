import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { UserProfile } from "@clerk/nextjs";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("email, role, created_at")
    .eq("clerk_id", userId)
    .single();

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-1">Account Settings</h1>
        <p className="text-slate-400 mb-8">
          Manage your profile and account preferences.
        </p>

        {user && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              Firm Role
            </h2>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-600/20 text-brand-300 border border-brand-600/30 capitalize">
                {user.role}
              </span>
              <span className="text-slate-500 text-sm">
                Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        )}

        <div className="[&_.cl-rootBox]:w-full [&_.cl-card]:bg-slate-900 [&_.cl-card]:border-slate-800">
          <UserProfile routing="hash" />
        </div>
      </div>
    </div>
  );
}
