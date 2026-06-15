import Link from 'next/link'
import { ArrowLeft, Check, X, Terminal, FileSearch, BarChart3 } from 'lucide-react'
import { CopyBlock } from '@/components/CopyButton'
import { GITHUB_URL } from '@/lib/utils'

export const metadata = {
  title: 'How it works — DistroInstall',
  description:
    'See exactly what the DistroInstall script collects, what it never touches, and how to inspect the code before you run it.',
}

const collected = [
  'Distribution name and version',
  'Kernel version',
  'Desktop environment',
  'CPU model, cores and threads',
  'Total RAM (in GB)',
  'GPU model',
  'Whether the machine is a virtual machine',
  'The usage type you choose (desktop, gaming, server…)',
]

const notCollected = [
  'Your IP address',
  'Any file names, paths or file contents',
  'Usernames, hostnames or MAC addresses',
  'Browsing history or installed applications',
  'Anything that can personally identify you',
]

export default function HowItWorksPage() {
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

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">How it works</h1>
        <p className="text-xl text-gray-300 mb-12">
          DistroInstall collects anonymous hardware and software stats from real Linux
          users — so we can all see what people actually run. Here&apos;s exactly how.
        </p>

        {/* 3 steps */}
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          <Step icon={<Terminal size={22} />} n={1} title="Run the script">
            One command, or download the Python file and read it first.
          </Step>
          <Step icon={<FileSearch size={22} />} n={2} title="It reads your specs">
            Distro, kernel, CPU, RAM, GPU — locally, then sends the summary.
          </Step>
          <Step icon={<BarChart3 size={22} />} n={3} title="See your stats">
            Get a shareable profile and compare against the community.
          </Step>
        </div>

        {/* The command */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-6">
          <p className="text-white font-semibold mb-3">Run it:</p>
          <CopyBlock text="curl -sSL https://distroinstall.com/install.sh | bash" />
          <p className="text-gray-400 text-sm mt-3">
            Prefer to run it yourself? Download{' '}
            <a href="/distroinstall.py" className="text-blue-400 hover:underline">distroinstall.py</a>{' '}
            and run <code className="text-gray-300">python3 distroinstall.py</code>.
          </p>
        </div>

        {/* Inspect first */}
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6 mb-14">
          <p className="text-white font-semibold mb-2">🔍 Don&apos;t trust, verify</p>
          <p className="text-gray-300 text-sm mb-4">
            We&apos;d never ask you to pipe a script into your shell without being able to read
            it first. Both files are public — open them in your browser before running anything.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/install.sh"
              className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Read install.sh
            </a>
            <a
              href="/distroinstall.py"
              className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Read distroinstall.py
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              View source on GitHub
            </a>
          </div>
        </div>

        {/* What we collect / don't */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">What we collect</h2>
            <ul className="space-y-2.5">
              {collected.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-gray-300 text-sm">
                  <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">What we never touch</h2>
            <ul className="space-y-2.5">
              {notCollected.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-gray-300 text-sm">
                  <X size={16} className="text-red-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Token explainer */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-4">About your token</h2>
          <div className="text-gray-300 leading-relaxed space-y-3">
            <p>
              The first time you submit, you get a unique <strong className="text-white">token</strong>.
              Save it and pass it on future runs to keep a history of your setup over time and
              build your{' '}
              <Link href="/" className="text-blue-400 hover:underline">public profile</Link>.
            </p>
            <p>
              Submitting without a token is completely anonymous — it just counts toward the
              aggregate stats. Create an account to link your submissions, earn badges, and
              export or delete your data anytime.
            </p>
          </div>
        </div>

        {/* API */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-4">Prefer not to run the script? Use the API</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            It&apos;s just a JSON <code className="text-green-300 bg-white/10 px-1.5 py-0.5 rounded">POST</code> over
            HTTPS. Gather the fields with whatever tools you trust and send them yourself — no need to run our script:
          </p>
          <pre className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-x-auto text-sm text-gray-200 leading-relaxed">
{`curl -X POST https://distroinstall.com/api/submit \\
  -H 'Content-Type: application/json' \\
  -d '{
    "system_info": {
      "distro_name": "Ubuntu",
      "distro_version": "24.04",
      "kernel": "6.8.0-51-generic",
      "desktop_environment": "GNOME",
      "cpu": "AMD Ryzen 7 7700X",
      "cpu_cores": 8,
      "cpu_threads": 16,
      "ram_gb": 32,
      "gpu": "Radeon RX 7800 XT"
    },
    "is_virtual": false,
    "usage_type": "desktop"
  }'`}
          </pre>
          <p className="text-gray-400 text-sm mt-3">
            Only <code className="text-gray-300">distro_name</code> is required.{' '}
            <code className="text-gray-300">usage_type</code> is one of desktop, programming, gaming,
            server or other. Add an optional <code className="text-gray-300">token</code> to keep a
            history or link submissions to your account. Full field reference in the{' '}
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              README on GitHub
            </a>.
          </p>
        </div>

        {/* Privacy link */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Your data, your control</h2>
          <p className="text-gray-300 mb-5">
            We never sell data, show ads, or use tracking cookies. Read the details in our
            privacy policy.
          </p>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
          >
            Read the Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  )
}

function Step({
  icon,
  n,
  title,
  children,
}: {
  icon: React.ReactNode
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3 text-purple-300">
        {icon}
        <span className="text-xs font-mono text-gray-500">STEP {n}</span>
      </div>
      <h3 className="text-white font-bold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
  )
}
