import Link from "next/link";

export const metadata = {
  title: "Privacy Architecture — LexSafe AI",
  description:
    "How LexSafe AI protects attorney-client privilege. A plain-English explanation of our technical and contractual privacy architecture.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <header className="border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-white font-semibold text-xl">
            <span className="text-brand-400">Lex</span>Safe AI
          </Link>
          <Link href="/signup" className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Start free trial
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-brand-400 text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy Architecture
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            How we protect your conversations
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Plain English. No legal boilerplate. Written for attorneys who need to understand
            the architecture before relying on it for privileged matters.
          </p>
        </div>

        <div className="space-y-10">
          <Section
            number="01"
            title="We use the Anthropic API — not the consumer Claude product"
          >
            <p>
              There is an important difference between using{" "}
              <strong className="text-slate-200">Claude.ai</strong> (Anthropic&apos;s consumer
              product) and using the{" "}
              <strong className="text-slate-200">Anthropic API</strong> (which is what we use).
            </p>
            <p>
              When you use Claude.ai directly, you are a consumer. Anthropic may use your
              conversations to improve their models depending on their terms at the time.
            </p>
            <p>
              When we use the Anthropic API, we are a business customer operating under a{" "}
              <strong className="text-slate-200">Data Processing Agreement</strong>. Under that
              agreement, Anthropic does not use API conversations for model training. The terms
              are contractual, not just policy.
            </p>
          </Section>

          <Section
            number="02"
            title="Conversations are never stored in our database"
          >
            <p>
              This is the most important thing to understand about our architecture:
            </p>
            <div className="bg-slate-900 border border-brand-600/30 rounded-xl p-5 my-4">
              <p className="text-white font-medium">
                When you send a message, it travels from your browser directly to our API server,
                which forwards it to Anthropic and streams the response back. At no point is any
                message written to our database.
              </p>
            </div>
            <p>
              Our database (Supabase) contains exactly three types of records: firm accounts,
              user accounts, and audit logs. The audit logs record that a session occurred and
              how long it lasted — not what was said.
            </p>
            <p>
              This is a technical constraint, not a policy promise. The code does not have a
              path for conversation content to reach the database.
            </p>
          </Section>

          <Section
            number="03"
            title="Anthropic&apos;s data retention policy"
          >
            <p>
              By default, Anthropic retains API inputs and outputs for up to{" "}
              <strong className="text-slate-200">30 days</strong> for trust & safety purposes,
              after which they are deleted. Anthropic does not use API data for training.
            </p>
            <p>
              Enterprise clients can request{" "}
              <strong className="text-slate-200">Zero Data Retention (ZDR)</strong>, under which
              Anthropic does not retain any inputs or outputs after the API call completes.
              This is available to our enterprise-tier clients. Contact us to add a ZDR
              addendum to your agreement.
            </p>
          </Section>

          <Section
            number="04"
            title="What happens when you close the window"
          >
            <p>
              When you close a chat session — whether by closing the tab, navigating away, or
              clicking &ldquo;New Session&rdquo; — the conversation is gone. Permanently.
            </p>
            <p>
              There is no conversation history feature. There is no &ldquo;resume previous session&rdquo;.
              This is intentional. The conversation exists only in your browser&apos;s React state
              while the window is open. When that state is cleared, the conversation no longer
              exists anywhere we control.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-4">
              <p className="text-slate-400 text-sm">
                <strong className="text-slate-300">Note on Anthropic&apos;s side:</strong> Anthropic
                may retain the API call for up to 30 days for trust & safety review before deletion.
                ZDR enterprise clients are exempt from this. In both cases, the retention is
                on Anthropic&apos;s infrastructure — not ours.
              </p>
            </div>
          </Section>

          <Section
            number="05"
            title="What the audit log does and does not contain"
          >
            <p>
              We maintain an audit log for enterprise compliance purposes. Law firms may need
              to demonstrate that they used AI tools responsibly. The audit log supports that.
            </p>
            <p>The audit log records:</p>
            <ul className="list-none space-y-2 my-3">
              {[
                "That a session was started (timestamp, user ID)",
                "That a session ended (timestamp, duration)",
                "Approximate token usage",
                "That a document was uploaded (filename, size — Phase 2)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-300">
                  <svg className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <p>The audit log never contains:</p>
            <ul className="list-none space-y-2 my-3">
              {[
                "The content of any message",
                "The text of any document",
                "Any response from the AI",
                "Any prompt or query",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-300">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section
            number="06"
            title="Your API key is never exposed to the browser"
          >
            <p>
              Our Anthropic API key is a server-side environment variable. It is never
              included in any JavaScript bundle or response sent to your browser. All AI
              requests are proxied through our Next.js server.
            </p>
            <p>
              Your browser communicates with our server using your authenticated session.
              Our server communicates with Anthropic using our API key. The browser never
              communicates with Anthropic directly.
            </p>
          </Section>

          <Section
            number="07"
            title="A note on attorney-client privilege"
          >
            <p>
              We believe this architecture is compatible with maintaining attorney-client
              privilege for attorney work product created with AI assistance. However, we
              are a software company, not law professors.
            </p>
            <p>
              The law on AI-assisted work product and privilege is evolving quickly and
              is jurisdiction-specific. We recommend consulting your state bar&apos;s ethics
              guidance and relevant case law in your jurisdiction before relying on
              AI-assisted work product in privilege-sensitive contexts.
            </p>
            <p>
              What we can say: our architecture is designed to minimize the privacy
              and privilege risks of AI tool use to the greatest extent technically
              feasible.
            </p>
          </Section>
        </div>

        <div className="mt-16 pt-10 border-t border-slate-800">
          <p className="text-slate-500 text-sm mb-6">
            Last updated: April 2026. Questions? Email{" "}
            <a href="mailto:privacy@lexsafe.ai" className="text-brand-400 hover:text-brand-300 transition-colors">
              privacy@lexsafe.ai
            </a>
          </p>
          <div className="flex gap-4">
            <Link href="/signup" className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm transition-colors">
              Start free trial
            </Link>
            <Link href="/" className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-sm transition-colors border border-slate-700">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <div className="text-brand-600/40 font-mono text-sm font-bold pt-1 shrink-0 w-6">
        {number}
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        <div className="space-y-3 text-slate-400 leading-relaxed text-[15px]">{children}</div>
      </div>
    </div>
  );
}
