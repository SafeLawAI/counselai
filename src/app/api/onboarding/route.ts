import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firmName, firmSize, practiceArea } = await req.json();

  if (!firmName || typeof firmName !== "string" || firmName.trim().length === 0) {
    return NextResponse.json({ error: "Firm name is required." }, { status: 400 });
  }

  // Check if user already has a firm
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("firm_id")
    .eq("clerk_id", userId)
    .single();

  if (existingUser?.firm_id) {
    return NextResponse.json({ error: "Firm already exists." }, { status: 409 });
  }

  // Get the user's email from Supabase (synced by webhook)
  const { data: userRecord } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .eq("clerk_id", userId)
    .single();

  // Create the firm
  const { data: firm, error: firmError } = await supabaseAdmin
    .from("firms")
    .insert({
      name: firmName.trim(),
      subscription_tier: "trial",
      subscription_status: "active",
      max_users: 5,
    })
    .select()
    .single();

  if (firmError || !firm) {
    console.error("Failed to create firm:", firmError);
    return NextResponse.json({ error: "Failed to create firm." }, { status: 500 });
  }

  if (userRecord) {
    // Update existing user record with firm_id and admin role
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ firm_id: firm.id, role: "admin" })
      .eq("clerk_id", userId);

    if (updateError) {
      console.error("Failed to update user:", updateError);
    }
  } else {
    // Fallback: create user record if webhook hasn't fired yet
    const { error: userError } = await supabaseAdmin.from("users").insert({
      clerk_id: userId,
      firm_id: firm.id,
      email: "",
      role: "admin",
    });

    if (userError) {
      console.error("Failed to create user:", userError);
    }
  }

  // Log the event (no content)
  await supabaseAdmin.from("audit_logs").insert({
    user_id: userRecord?.id ?? userId,
    firm_id: firm.id,
    event_type: "firm_created",
    timestamp: new Date().toISOString(),
    metadata: { firm_size: firmSize || null, practice_area: practiceArea || null },
  });

  return NextResponse.json({ firmId: firm.id });
}
