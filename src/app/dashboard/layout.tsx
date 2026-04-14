import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // Check user has completed onboarding (has a firm)
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, firm_id, role, email")
    .eq("clerk_id", userId)
    .single();

  if (!user?.firm_id) {
    redirect("/onboarding");
  }

  return (
    <div className="h-screen bg-slate-950 overflow-hidden">
      <DashboardSidebar userRole={user.role} />
      <main className="h-full overflow-hidden">{children}</main>
    </div>
  );
}
