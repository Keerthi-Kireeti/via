import Link from "next/link";
import { Panel, SectionHeading, Input, Button } from "@transitlink/ui";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <SectionHeading kicker="Access" title="Login to your role workspace" description="Use any demo email from the seed data in the API to simulate a role-aware login redirect." />
      <Panel title="Demo login" eyebrow="JWT auth">
        <form className="grid gap-4">
          <Input label="Email" placeholder="neha@transitlink.app" />
          <Input label="Password" placeholder="••••••••" type="password" />
          <Button size="lg">Sign in</Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <Link href="/signup" className="text-cyan-600 dark:text-cyan-300 font-medium">Create an account</Link>
          <Link href="/forgot-password" className="text-cyan-600 dark:text-cyan-300 font-medium">Forgot password</Link>
        </div>
      </Panel>
    </main>
  );
}
