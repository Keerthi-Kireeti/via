import { Panel, SectionHeading } from "@transitlink/ui";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <SectionHeading kicker="Onboarding" title="Create a TransitLink account" description="Passengers, logistics users, conductors, and admins all use the same identity system with role-aware routing." />
      <Panel title="Signup" eyebrow="Role-based access">
        <form className="grid gap-4 sm:grid-cols-2">
          <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="Full name" />
          <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="Email" />
          <select className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white"><option>Passenger</option><option>Logistics user</option><option>Conductor</option><option>Admin</option></select>
          <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="City" />
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 sm:col-span-2">Create account</button>
        </form>
      </Panel>
    </main>
  );
}
