import { redirect } from "next/navigation";

// /dashboard always redirects to the main product
export default function DashboardPage() {
  redirect("/dashboard/chat");
}
