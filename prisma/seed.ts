import { prisma } from '../lib/prisma'

const distros = [
  // [name, version, kernel, weight] — weight = cuántas veces aparece
  { name: 'Ubuntu',       version: '24.04',        kernel: '6.8.0-51-generic',          weight: 18 },
  { name: 'Ubuntu',       version: '22.04',        kernel: '6.5.0-45-generic',          weight: 10 },
  { name: 'Arch Linux',   version: 'rolling',      kernel: '6.12.1-arch1-1',            weight: 14 },
  { name: 'Fedora',       version: '41',           kernel: '6.11.5-300.fc41.x86_64',    weight: 10 },
  { name: 'Debian',       version: '12',           kernel: '6.1.0-28-amd64',            weight: 9  },
  { name: 'Linux Mint',   version: '22',           kernel: '6.8.0-51-generic',          weight: 8  },
  { name: 'Manjaro',      version: '24.1',         kernel: '6.11.10-1-MANJARO',         weight: 7  },
  { name: 'Pop!_OS',      version: '22.04',        kernel: '6.9.3-76060903-generic',    weight: 6  },
  { name: 'openSUSE',     version: 'Tumbleweed',   kernel: '6.11.7-1-default',          weight: 5  },
  { name: 'EndeavourOS',  version: '2024.09',      kernel: '6.11.7-arch1-1',            weight: 4  },
  { name: 'Zorin OS',     version: '17',           kernel: '6.8.0-51-generic',          weight: 3  },
  { name: 'NixOS',        version: '24.11',        kernel: '6.11.7-nixos',              weight: 3  },
  { name: 'Kali Linux',   version: '2024.3',       kernel: '6.10.14-amd64',             weight: 2  },
  { name: 'MX Linux',     version: '23.4',         kernel: '6.1.0-28-amd64',            weight: 2  },
  { name: 'Gentoo',       version: 'rolling',      kernel: '6.11.0-gentoo',             weight: 2  },
  { name: 'AlmaLinux',    version: '9.4',          kernel: '5.14.0-427.24.1.el9',       weight: 2  },
  { name: 'LMDE',         version: '6',            kernel: '6.1.0-28-amd64',            weight: 2  },
  { name: 'Garuda Linux', version: 'rolling',      kernel: '6.11.7-zen1-1-zen',         weight: 2  },
  { name: 'Rocky Linux',  version: '9.4',          kernel: '5.14.0-427.24.1.el9',       weight: 1  },
]

const desktops: Record<string, string[]> = {
  'Ubuntu':       ['GNOME', 'GNOME'],
  'Ubuntu 22.04': ['GNOME'],
  'Arch Linux':   ['KDE Plasma', 'Hyprland', 'i3', 'GNOME', 'Sway'],
  'Fedora':       ['GNOME', 'KDE Plasma'],
  'Debian':       ['GNOME', 'Xfce', 'KDE Plasma'],
  'Linux Mint':   ['Cinnamon', 'MATE', 'Xfce'],
  'Manjaro':      ['KDE Plasma', 'GNOME', 'Xfce'],
  'Pop!_OS':      ['COSMIC', 'GNOME'],
  'openSUSE':     ['KDE Plasma', 'GNOME'],
  'EndeavourOS':  ['KDE Plasma', 'i3', 'Sway', 'GNOME'],
  'Zorin OS':     ['GNOME'],
  'NixOS':        ['Hyprland', 'KDE Plasma', 'GNOME'],
  'Kali Linux':   ['Xfce', 'GNOME'],
  'MX Linux':     ['Xfce', 'KDE Plasma'],
  'Gentoo':       ['KDE Plasma', 'i3', 'Sway'],
  'AlmaLinux':    ['GNOME'],
  'LMDE':         ['Cinnamon'],
  'Garuda Linux': ['KDE Plasma'],
  'Rocky Linux':  ['GNOME'],
}

const cpus = [
  { cpu: 'AMD Ryzen 5 5600X',    cores: 6,  threads: 12 },
  { cpu: 'AMD Ryzen 5 7600X',    cores: 6,  threads: 12 },
  { cpu: 'AMD Ryzen 7 5800X',    cores: 8,  threads: 16 },
  { cpu: 'AMD Ryzen 7 7700X',    cores: 8,  threads: 16 },
  { cpu: 'AMD Ryzen 9 5900X',    cores: 12, threads: 24 },
  { cpu: 'AMD Ryzen 9 7950X',    cores: 16, threads: 32 },
  { cpu: 'Intel Core i3-12100',  cores: 4,  threads: 8  },
  { cpu: 'Intel Core i5-12600K', cores: 10, threads: 16 },
  { cpu: 'Intel Core i5-13600K', cores: 14, threads: 20 },
  { cpu: 'Intel Core i7-12700K', cores: 12, threads: 20 },
  { cpu: 'Intel Core i7-13700K', cores: 16, threads: 24 },
  { cpu: 'Intel Core i9-13900K', cores: 24, threads: 32 },
  { cpu: 'Intel Core i5-10400',  cores: 6,  threads: 12 },
  { cpu: 'Intel Xeon E5-2680',   cores: 8,  threads: 16 },
  { cpu: 'AMD Ryzen 5 3600',     cores: 6,  threads: 12 },
  { cpu: 'Intel Core i7-10700K', cores: 8,  threads: 16 },
]

const gpus = [
  'NVIDIA GeForce RTX 4090',
  'NVIDIA GeForce RTX 4080',
  'NVIDIA GeForce RTX 4070',
  'NVIDIA GeForce RTX 4070 Ti',
  'NVIDIA GeForce RTX 4060',
  'NVIDIA GeForce RTX 3080',
  'NVIDIA GeForce RTX 3070',
  'NVIDIA GeForce RTX 3060',
  'NVIDIA GeForce GTX 1660 Ti',
  'NVIDIA GeForce GTX 1080 Ti',
  'AMD Radeon RX 7900 XTX',
  'AMD Radeon RX 7800 XT',
  'AMD Radeon RX 7600',
  'AMD Radeon RX 6800 XT',
  'AMD Radeon RX 6700 XT',
  'AMD Radeon RX 6600',
  'Intel Arc A770',
  'Intel Arc A750',
  'Intel UHD Graphics 770',
  'Intel UHD Graphics 630',
  'AMD Radeon Vega 8',
]

const rams = [8, 8, 16, 16, 16, 32, 32, 32, 64, 64]
const usageTypes = ['desktop', 'desktop', 'programming', 'programming', 'gaming', 'gaming', 'server', 'other']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(): Date {
  const now = Date.now()
  const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000
  return new Date(sixMonthsAgo + Math.random() * (now - sixMonthsAgo))
}

function buildPool() {
  const pool: typeof distros = []
  for (const d of distros) {
    for (let i = 0; i < d.weight; i++) pool.push(d)
  }
  return pool
}

async function main() {
  console.log('🌱 Seeding database with realistic submissions...')

  // Borrar seeds anteriores para evitar duplicados
  await prisma.submission.deleteMany({ where: { token: { startsWith: 'seed_' } } })

  const pool = buildPool()
  const total = 110
  const created: Promise<unknown>[] = []

  for (let i = 0; i < total; i++) {
    const distro = pick(pool)
    const desktopList = desktops[distro.name] ?? ['GNOME']
    const cpu = pick(cpus)
    const isVirtual = Math.random() < 0.15 // 15% VMs

    created.push(
      prisma.submission.create({
        data: {
          token: `seed_${i.toString().padStart(3, '0')}_${Math.random().toString(36).slice(2, 8)}`,
          distroName: distro.name,
          distroVersion: distro.version,
          kernel: distro.kernel,
          desktopEnv: pick(desktopList),
          cpu: cpu.cpu,
          cpuCores: cpu.cores,
          cpuThreads: cpu.threads,
          ram: pick(rams),
          gpu: pick(gpus),
          isVirtual,
          usageType: pick(usageTypes),
          timestamp: randomDate(),
        },
      })
    )
  }

  await Promise.all(created)
  console.log(`✅ Created ${total} seed submissions`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
