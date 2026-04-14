import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Nav />
      <Hero />
      <TrustBar />
      <Features />
      <PrivacySection />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="border-b border-slate-800/50 sticky top-0 bg-slate-950/90 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-white font-semibold text-xl">
          <span className="text-brand-400">Lex</span>Safe AI
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600/10 border border-brand-600/20 rounded-full text-brand-400 text-xs font-medium mb-8">
        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
        Built for licensed attorneys. Not the general public.
      </div>

      <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6 max-w-4xl mx-auto">
        AI-powered legal research.{" "}
        <span className="text-brand-400">Privilege-protected</span> by design.
      </h1>

      <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        LexSafe AI gives attorneys a private research and drafting assistant. Conversations are
        never stored in our database, never used to train AI models, and end permanently when
        you close the window.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/signup"
          className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors text-base"
        >
          Start 14-day free trial
        </Link>
        <Link
          href="/privacy"
          className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors text-base border border-slate-700"
        >
          How privacy works →
        </Link>
      </div>

      <p className="text-slate-500 text-sm mt-6">No credit card required. Cancel any time.</p>
    </section>
  );
}

function TrustBar() {
  const items = [
    "Conversations never stored",
    "Zero AI training on your data",
    "Anthropic API — not consumer Claude",
    "7-day data deletion by default",
    "ZDR available for enterprise",
  ];

  return (
    <section className="border-y border-slate-800/50 bg-slate-900/30 py-5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-400 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: "⚖️",
      title: "Legal Research",
      desc: "Research case law, statutes, and regulations. The assistant knows when to flag unsettled law or jurisdiction-specific issues.",
    },
    {
      icon: "📄",
      title: "Document Drafting",
      desc: "Draft motions, briefs, contracts, and memos. Describe what you need and get a professional starting point in seconds.",
    },
    {
      icon: "🔍",
      title: "Document Analysis",
      desc: "Paste a contract or brief and ask questions about it. Identify issues, summarize provisions, and flag risk areas.",
    },
    {
      icon: "💬",
      title: "Strategy Discussion",
      desc: "Think through litigation strategy, settlement options, or deal structure with an assistant that understands legal reasoning.",
    },
    {
      icon: "🔒",
      title: "Privilege-Compatible",
      desc: "Built on Anthropic's API with a contractual data processing agreement. No conversation content ever hits our servers.",
    },
    {
      icon: "🏢",
      title: "Firm-Level Isolation",
      desc: "Each firm is a siloed environment. Users can only access their own sessions. Firm admins manage their own team.",
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">
          Everything an attorney needs. Nothing they don&apos;t.
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Designed for legal professionals who can&apos;t compromise on confidentiality.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="text-2xl mb-4">{f.icon}</div>
            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section id="privacy" className="bg-slate-900/40 border-y border-slate-800/50">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-brand-400 text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy Architecture
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Private by architecture, not just policy.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Most AI products store your conversations. We don&apos;t. Our architecture makes it
              technically impossible for conversation content to reach our database — it flows
              directly from your browser to Anthropic&apos;s API and back.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8">
              We use Anthropic&apos;s API product — not the consumer Claude.ai. This means a Data
              Processing Agreement governs our relationship, conversations aren&apos;t used for training,
              and enterprise clients can request Zero Data Retention.
            </p>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Read the full privacy architecture →
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { label: "Our database contains", value: "User accounts and firm settings only" },
              { label: "What we never store", value: "Conversation content of any kind" },
              { label: "Anthropic data retention", value: "7 days by default, ZDR for enterprise" },
              { label: "AI training on your data", value: "Never. Contractually prohibited." },
              { label: "Session persistence", value: "None. Closed window = gone forever." },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-slate-200 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Solo",
      price: "$79",
      period: "/month",
      users: "1 attorney",
      features: ["Full chat access", "14-day free trial", "Privacy-protected sessions"],
      cta: "Start free trial",
      href: "/signup",
      highlight: false,
    },
    {
      name: "Firm",
      price: "$199",
      period: "/month",
      users: "Up to 5 attorneys",
      features: ["Everything in Solo", "Firm admin panel", "Audit logs", "User management"],
      cta: "Start free trial",
      href: "/signup",
      highlight: true,
    },
    {
      name: "Professional",
      price: "$499",
      period: "/month",
      users: "Up to 20 attorneys",
      features: ["Everything in Firm", "Priority support", "Advanced audit logs"],
      cta: "Start free trial",
      href: "/signup",
      highlight: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      users: "Unlimited",
      features: ["Zero Data Retention agreement", "SSO integration", "Custom SLA", "Dedicated support"],
      cta: "Contact us",
      href: "mailto:hello@lexsafe.ai",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">Simple, transparent pricing</h2>
        <p className="text-slate-400 text-lg">14-day free trial on all plans. No credit card required.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl p-6 flex flex-col ${
              plan.highlight
                ? "bg-brand-600/10 border-2 border-brand-600/50"
                : "bg-slate-900 border border-slate-800"
            }`}
          >
            {plan.highlight && (
              <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3">
                Most Popular
              </div>
            )}
            <h3 className="text-white font-bold text-lg">{plan.name}</h3>
            <div className="mt-2 mb-1">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-slate-400 text-sm">{plan.period}</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">{plan.users}</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                plan.highlight
                  ? "bg-brand-600 hover:bg-brand-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-slate-800/50 bg-slate-900/30">
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to give it a try?
        </h2>
        <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
          Start your 14-day free trial today. No credit card, no setup fees.
          Your first session can start in under two minutes.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors text-base"
        >
          Start free trial
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800/50">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-1.5 text-white font-semibold">
          <span className="text-brand-400">Lex</span>Safe AI
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Architecture</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
        </nav>
        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} LexSafe AI. Built for attorneys.
        </p>
      </div>
    </footer>
  );
}
