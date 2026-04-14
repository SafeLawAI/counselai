import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

export default async function ManageUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { data: currentUser } = await supabaseAdmin
    .from("users")
    .select("role, firm_id")
    .eq("clerk_id", userId)
    .single();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard/chat");
  }

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, email, role, created_at, last_active")
    .eq("firm_id", currentUser.firm_id)
    .order("created_at", { ascending: true });

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Manage Users</h1>
            <p className="text-slate-400">
              {users?.length ?? 0} member{(users?.length ?? 0) !== 1 ? "s" : ""} in your firm
            </p>
          </div>
          <InviteButton />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-200">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {user.last_active
                      ? new Date(user.last_active).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <p className="text-sm text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-medium">Inviting colleagues:</span> Send an invitation
            from your Clerk dashboard. When they sign up with the invitation link, they&apos;ll be
            automatically associated with your firm.
          </p>
        </div>
      </div>
    </div>
  );
}

function InviteButton() {
  return (
    <button
      disabled
      className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg opacity-60 cursor-not-allowed"
      title="Invitation flow coming in Phase 2"
    >
      Invite User
    </button>
  );
}
