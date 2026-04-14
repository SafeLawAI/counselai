import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// System prompt is ONLY ever on the server — never exposed to the client
const LEGAL_SYSTEM_PROMPT = `You are a private legal research and drafting assistant for licensed attorneys.

You are operating within a secure, privilege-protected environment. This conversation is confidential and not stored or used for training.

Your role is to assist attorneys with:
- Legal research and case law analysis
- Document drafting (contracts, motions, briefs, memos)
- Legal strategy discussions
- Summarizing and analyzing documents
- Identifying legal issues and risks

Important guidelines:
- You are assisting a licensed attorney, not providing legal advice directly to a client
- Always cite relevant statutes, regulations, or case law when applicable
- Flag when an area of law is unsettled or jurisdiction-specific
- Be precise and professional in all responses
- If asked about something outside your knowledge cutoff, say so clearly
- Never fabricate case citations — if you are uncertain about a citation, say so explicitly

You do not provide legal advice to members of the public. You assist attorneys in their professional work.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user exists in database
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, firm_id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found." }, { status: 403 });
  }

  let messages: ChatMessage[];
  let sessionId: string | undefined;

  try {
    const body = await req.json();
    messages = body.messages;
    sessionId = body.sessionId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
  }

  // Validate messages structure
  for (const msg of messages) {
    if (!msg.role || !msg.content || typeof msg.content !== "string") {
      return NextResponse.json({ error: "Invalid message format." }, { status: 400 });
    }
    if (msg.role !== "user" && msg.role !== "assistant") {
      return NextResponse.json({ error: "Invalid message role." }, { status: 400 });
    }
  }

  // Limit context window to last 40 messages to prevent abuse
  const contextMessages = messages.slice(-40);

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Log session start (no content)
  if (messages.length === 1 && sessionId) {
    supabaseAdmin.from("audit_logs").insert({
      user_id: user.id,
      firm_id: user.firm_id,
      event_type: "session_started",
      timestamp: new Date().toISOString(),
      metadata: { session_id: sessionId, model: "claude-sonnet-4-6" },
    });
  }

  // Update last_active timestamp
  supabaseAdmin
    .from("users")
    .update({ last_active: new Date().toISOString() })
    .eq("id", user.id);

  // Stream the response from Anthropic
  const stream = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: LEGAL_SYSTEM_PROMPT,
    messages: contextMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    stream: true,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = encoder.encode(event.delta.text);
            controller.enqueue(chunk);
          }
        }
        controller.close();
      } catch (err) {
        console.error("Streaming error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
      // Prevent caching of any AI responses
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
