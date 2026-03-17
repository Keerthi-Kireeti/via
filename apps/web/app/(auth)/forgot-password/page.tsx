import { Panel, SectionHeading } from "@transitlink/ui";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <SectionHeading kicker="Recovery" title="Reset access" description="In the MVP this is a placeholder for password reset and support-assisted depot account recovery." />
      <Panel title="Password reset" eyebrow="Coming soon">
        <input className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="Email" />
        <button className="mt-4 rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950">Send reset link</button>
      </Panel>
    </main>
  );
}
