const FROM = 'DistroInstall <noreply@distroinstall.com>'

function shell(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#f1f5f9;border-radius:16px;padding:40px;">
      <h1 style="font-size:28px;margin:0 0 8px;color:#f1f5f9;">
        <span style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-family:monospace;font-weight:700;padding:4px 10px;border-radius:8px;margin-right:8px;">&gt;_</span>
        DistroInstall
      </h1>
      <p style="color:#94a3b8;margin:0 0 32px;">Real stats from real Linux users</p>
      <h2 style="font-size:20px;margin:0 0 12px;">${title}</h2>
      ${bodyHtml}
    </div>
  `
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('Resend email failed:', res.status, detail)
    throw new Error(`Failed to send email (${res.status})`)
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/api/verify?token=${token}`

  await sendEmail(
    email,
    'Verify your DistroInstall account',
    shell(
      'Verify your account',
      `
        <p style="color:#cbd5e1;margin:0 0 24px;">
          Click the button below to activate your account. The link expires in 24 hours.
        </p>
        <a href="${link}"
          style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:15px;">
          Verify account
        </a>
        <p style="color:#475569;font-size:12px;margin:24px 0 0;">
          If you did not create this account, you can safely ignore this email.<br/>
          Or copy this link: <span style="color:#818cf8;">${link}</span>
        </p>
      `,
    ),
  )
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/reset-password?token=${token}`

  await sendEmail(
    email,
    'Reset your DistroInstall password',
    shell(
      'Reset your password',
      `
        <p style="color:#cbd5e1;margin:0 0 24px;">
          We received a request to reset your password. Click the button below to choose a new one.
          This link expires in 1 hour.
        </p>
        <a href="${link}"
          style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:15px;">
          Reset password
        </a>
        <p style="color:#475569;font-size:12px;margin:24px 0 0;">
          If you did not request this, you can safely ignore this email — your password won't change.<br/>
          Or copy this link: <span style="color:#818cf8;">${link}</span>
        </p>
      `,
    ),
  )
}
