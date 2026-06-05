import Link from 'next/link'
import { ArrowLeft, Mail, Shield, FileQuestion } from 'lucide-react'

export const metadata = {
  title: 'Contact — DistroInstall',
  description: 'Get in touch with the DistroInstall team.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-2xl">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <h1 className="text-5xl font-bold text-white mb-3">Contact</h1>
        <p className="text-xl text-gray-300 mb-10">
          Questions, feedback, bug reports or data requests — we&apos;d love to hear from you.
        </p>

        {/* Email card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Email us</h2>
          </div>
          <p className="text-gray-300 mb-5">
            Drop us a line and we&apos;ll get back to you as soon as we can.
          </p>
          <a
            href="mailto:distroinstall@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
          >
            <Mail size={16} />
            distroinstall@gmail.com
          </a>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/how-it-works"
            className="flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition-colors"
          >
            <FileQuestion className="text-blue-400 shrink-0" size={22} />
            <div>
              <p className="text-white font-semibold">How it works</p>
              <p className="text-gray-400 text-sm">What the script collects and how to inspect it.</p>
            </div>
          </Link>
          <Link
            href="/privacy"
            className="flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition-colors"
          >
            <Shield className="text-green-400 shrink-0" size={22} />
            <div>
              <p className="text-white font-semibold">Privacy & your data</p>
              <p className="text-gray-400 text-sm">Export, delete or learn how your data is handled.</p>
            </div>
          </Link>
        </div>

      </div>
    </main>
  )
}
