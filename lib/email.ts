export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/api/verify?token=${token}`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DistroInstall <onboarding@resend.dev>',
      to: email,
      subject: '🐧 Verifica tu cuenta en DistroInstall',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#f1f5f9;border-radius:16px;padding:40px;">
          <h1 style="font-size:32px;margin:0 0 8px;">🐧 DistroInstall</h1>
          <p style="color:#94a3b8;margin:0 0 32px;">Real stats from real Linux users</p>

          <h2 style="font-size:20px;margin:0 0 12px;">Verifica tu cuenta</h2>
          <p style="color:#cbd5e1;margin:0 0 24px;">
            Haz clic en el botón para activar tu cuenta. El enlace expira en 24 horas.
          </p>

          <a href="${link}"
            style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:15px;">
            Verificar cuenta
          </a>

          <p style="color:#475569;font-size:12px;margin:24px 0 0;">
            Si no creaste esta cuenta, ignora este email.<br/>
            O copia este enlace: <span style="color:#818cf8;">${link}</span>
          </p>
        </div>
      `,
    }),
  })
}
