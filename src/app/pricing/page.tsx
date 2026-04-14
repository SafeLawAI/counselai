import Link from "next/link";

export const metadata = {
  title: "Pricing — LexSafe AI",
  description: "Simple, transparent pricing for attorneys and law firms. 14-day free trial on all plans.",
};

const plans = [
  {
    name: "Solo",
    price: "$79",
    period: "/month",
    description: "For solo practitioners",
    users: "1 attorney",
    features: [
      "Full AI chat access",
      "In-session document analysis",
      "Streaming responses",
      "14-day free trial",
      "Privacy-protected sessions",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Firm",
    price: "$199",
    period: "/month",
    description: "For small practices",
    users: "Up to 5 attorneys",
    features: [
      "Everything in Solo",
      "Firm admin dashboard",
      "User management",
      "Audit log access",
      "14-day free trial",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Professional",
    price: "$499",
    period: "/month",
    description: "For growing firms",
    users: "Up to 20 attorneys",
    features: [
      "Everything in Firm",
      "Priority support",
      "Advanced audit reports",
      "Early access to new features",
      "14-day free trial",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large firms",
    users: "Unlimited attorneys",
    features: [
      "Everything in Professional",
      "Zero Data Retention (ZDR)",
      "SSO / SAML integration",
      "Custom Data Processing Agreement",
      "Dedicated account manager",
      "Custom SLA",
    ],
    cta: "Contact us",
    href: "mailto:enterprise@lexsafe.ai",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-white font-semibold text-xl">
            <span className="text-brand-400">Lex</span>Safe AI
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            All plans include a 14-day free trial. No credit card required to start.
            Cancel any time.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col ${
                plan.highlight
                  ? "bg-brand-600/10 border-2 border-brand-600/50 ring-1 ring-brand-600/20"
                  : "bg-slate-900 border border-slate-800"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3">
                  Most Popular
                </div>
              )}
              <h3 className="text-white font-bold text-lg">{plan.name}</h3>
              <p className="text-slate-500 text-xs mt-0.5 mb-3">{plan.description}</p>
              <div className="mb-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.period}</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">{plan.users}</p>
              <ul className="space-y-3 mb-8 flex-1">
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
                className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
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

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "What happens after the free trial?",
                a: "You'll be prompted to add a payment method. If you don't, your account is paused — no data is deleted and you can reactivate at any time.",
              },
              {
                q: "Are conversations ever stored?",
                a: "No. Conversation content never touches our database. It flows from your browser to Anthropic's API and back. When you close the session, it's gone.",
              },
              {
                q: "What is Zero Data Retention (ZDR)?",
                a: "ZDR is a configuration available on Anthropic's API where they don't retain any input or output after the API call completes. It requires a contract addendum and is available to Enterprise clients.",
              },
              {
                q: "Can I add colleagues to my firm?",
                a: "Yes. Firm and above plans include user management. You can invite attorneys and paralegals to your firm's workspace.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a full refund within 7 days of your first charge if you're not satisfied. Contact us at billing@lexsafe.ai.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-slate-800 pb-6">
                <h3 className="text-white font-medium mb-2">{q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
