import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ChatInterface from "@/components/ChatInterface";

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("clerk_id", userId)
    .single();

  return <ChatInterface userRole={user?.role ?? "attorney"} />;
}
