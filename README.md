<p align="center">
  <img src="public/logo.svg" width="72" alt="DistroInstall logo" />
</p>

<h1 align="center">DistroInstall</h1>

<p align="center"><strong>Real stats from real Linux users.</strong></p>

DistroInstall is a community-driven platform that collects anonymous hardware and
software statistics from Linux users. Run a small script, and your distro, desktop,
CPU, RAM and GPU are added to a public dataset so everyone can see what people
*actually* run — and how their own setup compares.

🌐 **Live:** [distroinstall.com](https://distroinstall.com)

---

## Features

- 📊 **Community dashboard** — top distributions, desktop environments, usage types, hardware averages and 30-day growth.
- 🔥 **Trending distros** — week-over-week movers.
- 🆚 **Compare** — put any two distributions side by side.
- 🧑‍💻 **Per-distro pages** — versions, kernels, desktops, GPUs, plus a description and link to the official site.
- 🏅 **Badges & profiles** — earn badges and get a shareable public profile.
- 🔑 **Accounts** — link submissions to your account, export your data (JSON) or delete it (GDPR).
- 🔒 **Privacy-first** — no IP addresses, no tracking cookies, no ads. See [/privacy](https://distroinstall.com/privacy).

## How it works

```bash
curl -sSL https://distroinstall.com/install.sh | bash
```

The script reads your system specs locally and submits a summary. You can also
download and inspect [`distroinstall.py`](https://distroinstall.com/distroinstall.py)
and run it yourself. See [how it works](https://distroinstall.com/how-it-works)
for exactly what is (and isn't) collected.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** (dark glassmorphism theme)
- **Prisma** ORM + **PostgreSQL** (Neon)
- **NextAuth** (Google, GitHub, email/password)
- **Recharts** for charts
- **Resend** for transactional email
- Deployed on **Vercel**

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example and fill it in:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `POSTGRES_PRISMA_URL` | Pooled Postgres connection string (Prisma) |
| `POSTGRES_URL_NON_POOLING` | Direct connection (migrations / `db push`) |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` in dev) |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth |
| `RESEND_API_KEY` | Resend API key for verification emails |

> ⚠️ Use a **separate database for local development**. The dev and production
> databases must not be shared, since the seed script inserts fake data.

### 3. Set up the database

```bash
npx prisma db push     # create the schema
npx prisma db seed     # (optional) load ~110 fake submissions for local testing
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/            Next.js routes (pages + API)
  api/          submit, register, verify, account, export, claim…
  distro/       per-distribution pages
  dashboard/    user dashboard
  compare/      side-by-side comparison
components/     UI components (charts, navbar, forms…)
lib/            prisma client, auth, email, badges, distros, rate limiting
prisma/         schema + seed
public/         distroinstall.py, install.sh, static assets
```

## Privacy

DistroInstall collects only anonymous system data and (optionally) account info
you provide. No IP addresses, file data or tracking. The single session cookie is
strictly necessary for authentication. Full details in the
[Privacy Policy](https://distroinstall.com/privacy).

## License

MIT
