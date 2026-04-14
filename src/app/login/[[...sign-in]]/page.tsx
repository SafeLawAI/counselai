import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-white text-2xl font-semibold">
            <span className="text-brand-400">Lex</span>Safe AI
          </a>
          <p className="text-slate-400 mt-2 text-sm">Sign in to your account</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
