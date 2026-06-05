import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-3xl">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <h1 className="text-5xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: June 2025</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <Section title="What is DistroInstall?">
            <p>
              DistroInstall is a community-driven platform that collects anonymous hardware and
              software statistics from Linux users. The goal is to show real-world data about
              which distributions and hardware configurations people actually use.
            </p>
          </Section>

          <Section title="What data we collect">
            <p className="mb-3">We collect two types of data:</p>
            <ul className="space-y-2 list-none">
              <Li title="System data (via the script)">
                Distribution name and version, kernel version, desktop environment, CPU model and
                core count, RAM amount (in GB), GPU model, whether the machine is a virtual machine,
                and the self-reported usage type (desktop, gaming, server, etc.).
                No personal identifiers, IP addresses, or file system data are collected.
              </Li>
              <Li title="Account data (if you register)">
                Email address, display name, and profile picture — provided by your OAuth provider
                (Google or GitHub) or entered directly. We also store a unique submission token
                so you can link your script submissions to your account.
              </Li>
            </ul>
          </Section>

          <Section title="How we use it">
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Display aggregate statistics on the public dashboard</li>
              <li>Show you how your hardware compares to the community</li>
              <li>Award badges based on your submission history</li>
              <li>Let you manage and delete your own submissions</li>
            </ul>
            <p className="mt-3">
              We do not sell your data, show you ads, or share it with third parties.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use a single session cookie to keep you logged in. This cookie is strictly
              necessary for authentication and is set only when you sign in. We do not use
              analytics cookies, tracking pixels, or any third-party cookies.
            </p>
            <p className="mt-2">
              Because our cookies are technically necessary for the service to work, they do not
              require a consent banner under GDPR.
            </p>
          </Section>

          <Section title="Your rights (GDPR)">
            <p className="mb-3">
              If you are in the European Union, you have the following rights regarding your data:
            </p>
            <ul className="space-y-2 list-none">
              <Li title="Right of access">
                You can export all data we hold about you at any time from your{' '}
                <Link href="/dashboard" className="text-blue-400 hover:underline">dashboard</Link>
                {' '}(Export my data button).
              </Li>
              <Li title="Right to erasure">
                You can delete individual submissions at any time, or delete your entire account
                (including all associated data) from your dashboard. Deletion is immediate and
                cannot be undone.
              </Li>
              <Li title="Right to portability">
                The export feature provides your data in JSON format, which is
                machine-readable and human-readable.
              </Li>
              <Li title="Right to object">
                System data submitted without an account is anonymous by design. If you submitted
                with an account, you can delete those submissions at any time.
              </Li>
            </ul>
          </Section>

          <Section title="Data retention">
            <p>
              We keep your data for as long as your account is active. If you delete your account,
              all associated data (submissions, badges, tokens) is deleted immediately.
              Anonymous submissions (submitted without a token) are kept indefinitely to
              maintain the accuracy of the aggregate statistics.
            </p>
          </Section>

          <Section title="Third-party services">
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-white">Vercel</strong> — hosts the application. Vercel
                processes request logs per their own privacy policy.
              </li>
              <li>
                <strong className="text-white">Google / GitHub OAuth</strong> — used as optional
                login providers. We only receive the data you authorize (email, name, avatar).
              </li>
              <li>
                <strong className="text-white">Resend</strong> — used to send email verification
                messages. We do not send marketing email.
              </li>
            </ul>
          </Section>

          <Section title="Contact">
            <p>
              If you have any questions about this policy or want to exercise your rights,
              contact us at{' '}
              <a href="mailto:distroinstall@gmail.com" className="text-blue-400 hover:underline">
                distroinstall@gmail.com
              </a>.
            </p>
          </Section>

        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-3 pb-2 border-b border-white/10">{title}</h2>
      {children}
    </section>
  )
}

function Li({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="pl-4 border-l-2 border-purple-500/40">
      <span className="text-white font-semibold">{title}: </span>
      {children}
    </li>
  )
}
