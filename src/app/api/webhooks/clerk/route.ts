import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserCreatedEvent {
  type: "user.created";
  data: {
    id: string;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string;
  };
}

interface ClerkUserDeletedEvent {
  type: "user.deleted";
  data: {
    id: string;
    deleted: boolean;
  };
}

type ClerkWebhookEvent = ClerkUserCreatedEvent | ClerkUserDeletedEvent;

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers." }, { status: 400 });
  }

  const body = await req.text();

  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { id: clerkId, email_addresses, primary_email_address_id } = event.data;

    const primaryEmail =
      email_addresses.find((e) => e.id === primary_email_address_id)?.email_address ??
      email_addresses[0]?.email_address ??
      "";

    // Create user record. firm_id will be set later during onboarding.
    // We use upsert to handle duplicate webhook deliveries gracefully.
    const { error } = await supabaseAdmin.from("users").upsert(
      {
        clerk_id: clerkId,
        email: primaryEmail,
        role: "attorney",
        // firm_id intentionally null until onboarding completes
      },
      { onConflict: "clerk_id" }
    );

    if (error) {
      console.error("Clerk webhook — failed to create user:", error);
      return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
    }
  }

  if (event.type === "user.deleted") {
    const { id: clerkId } = event.data;

    // Soft-delete: look up the user first for audit purposes
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (user) {
      await supabaseAdmin.from("users").delete().eq("clerk_id", clerkId);
    }
  }

  return NextResponse.json({ received: true });
}
