# 1. Crear el nuevo seed
cat > prisma/seed.ts << 'EOF'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🌱 Seeding database...')

  // Crear algunos ejemplos de submissions
  const submissions = await Promise.all([
    prisma.submission.create({
      data: {
        token: 'seed_ubuntu_001',
        distroName: 'Ubuntu',
        distroVersion: '24.04',
        kernel: '6.8.0-45-generic',
        desktopEnv: 'GNOME',
        cpu: 'Intel Core i7-12700K',
        cpuCores: 12,
        cpuThreads: 20,
        ram: 32,
        gpu: 'NVIDIA GeForce RTX 4070',
        isVirtual: false,
        usageType: 'programming',
      },
    }),
    prisma.submission.create({
      data: {
        token: 'seed_arch_001',
        distroName: 'Arch Linux',
        distroVersion: 'rolling',
        kernel: '6.11.5-arch1-1',
        desktopEnv: 'KDE Plasma',
        cpu: 'AMD Ryzen 9 7950X',
        cpuCores: 16,
        cpuThreads: 32,
        ram: 64,
        gpu: 'AMD Radeon RX 7900 XTX',
        isVirtual: false,
        usageType: 'gaming',
      },
    }),
    prisma.submission.create({
      data: {
        token: 'seed_fedora_001',
        distroName: 'Fedora',
        distroVersion: '40',
        kernel: '6.10.11-200.fc40.x86_64',
        desktopEnv: 'GNOME',
        cpu: 'Intel Core i5-13600K',
        cpuCores: 14,
        cpuThreads: 20,
        ram: 32,
        gpu: 'Intel Arc A770',
        isVirtual: false,
        usageType: 'desktop',
      },
    }),
    prisma.submission.create({
      data: {
        token: 'seed_debian_001',
        distroName: 'Debian',
        distroVersion: '12',
        kernel: '6.1.0-13-amd64',
        desktopEnv: 'Xfce',
        cpu: 'Intel Xeon E5-2680',
        cpuCores: 8,
        cpuThreads: 16,
        ram: 16,
        gpu: 'Matrox G200eW',
        isVirtual: true,
        usageType: 'server',
      },
    }),
    prisma.submission.create({
      data: {
        token: 'seed_manjaro_001',
        distroName: 'Manjaro',
        distroVersion: '23.1',
        kernel: '6.6.30-2-MANJARO',
        desktopEnv: 'KDE Plasma',
        cpu: 'AMD Ryzen 5 5600X',
        cpuCores: 6,
        cpuThreads: 12,
        ram: 16,
        gpu: 'NVIDIA GeForce GTX 1660 Ti',
        isVirtual: false,
        usageType: 'gaming',
      },
    }),
    prisma.submission.create({
      data: {
        token: 'seed_mint_001',
        distroName: 'Linux Mint',
        distroVersion: '21.3',
        kernel: '6.5.0-14-generic',
        desktopEnv: 'Cinnamon',
        cpu: 'Intel Core i3-10100',
        cpuCores: 4,
        cpuThreads: 8,
        ram: 8,
        gpu: 'Intel UHD Graphics 630',
        isVirtual: false,
        usageType: 'desktop',
      },
    }),
    prisma.submission.create({
      data: {
        token: 'seed_opensuse_001',
        distroName: 'openSUSE',
        distroVersion: 'Tumbleweed',
        kernel: '6.10.5-1-default',
        desktopEnv: 'KDE Plasma',
        cpu: 'AMD Ryzen 7 5800X',
        cpuCores: 8,
        cpuThreads: 16,
        ram: 32,
        gpu: 'AMD Radeon RX 6800',
        isVirtual: false,
        usageType: 'programming',
      },
    }),
    prisma.submission.create({
      data: {
        token: 'seed_popos_001',
        distroName: 'Pop!_OS',
        distroVersion: '22.04',
        kernel: '6.9.3-76060903-generic',
        desktopEnv: 'GNOME',
        cpu: 'Intel Core i9-13900K',
        cpuCores: 24,
        cpuThreads: 32,
        ram: 64,
        gpu: 'NVIDIA GeForce RTX 4090',
        isVirtual: false,
        usageType: 'gaming',
      },
    }),
  ])

  console.log(`✅ Created ${submissions.length} seed submissions`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
