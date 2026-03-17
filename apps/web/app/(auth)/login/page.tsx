import Link from "next/link";
import { Panel, SectionHeading } from "@transitlink/ui";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <SectionHeading kicker="Access" title="Login to your role workspace" description="Use any demo email from the seed data in the API to simulate a role-aware login redirect." />
      <Panel title="Demo login" eyebrow="JWT auth">
        <form className="grid gap-4">
          <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="Email" />
          <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="Password" type="password" />
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950">Sign in</button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <Link href="/signup" className="text-cyan-300">Create an account</Link>
          <Link href="/forgot-password" className="text-cyan-300">Forgot password</Link>
        </div>
      </Panel>
    </main>
  );
}
