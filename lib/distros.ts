// Curated metadata for well-known distributions: a short description and the
// official homepage. Submission names come from the `distro` Python library, so
// real-world values vary ("Debian GNU/Linux", "Fedora Linux"…). getDistroMeta
// does a tolerant match (exact, then substring) so minor naming differences
// still resolve.

export type DistroMeta = {
  description: string
  url: string
  basedOn?: string
}

const DISTROS: Record<string, DistroMeta> = {
  ubuntu: {
    description:
      'The most popular desktop Linux distribution, developed by Canonical. Beginner-friendly with a 6-month release cycle and long-term support (LTS) versions.',
    url: 'https://ubuntu.com',
    basedOn: 'Debian',
  },
  debian: {
    description:
      'One of the oldest and most influential distributions. Renowned for its stability and huge software repository, it forms the base for Ubuntu and many others.',
    url: 'https://www.debian.org',
  },
  'arch linux': {
    description:
      'A lightweight, rolling-release distribution that follows a do-it-yourself philosophy. Highly customizable and paired with the famous Arch Wiki.',
    url: 'https://archlinux.org',
  },
  fedora: {
    description:
      'A cutting-edge distribution sponsored by Red Hat. Ships recent technologies first and acts as the upstream for RHEL.',
    url: 'https://fedoraproject.org',
  },
  'linux mint': {
    description:
      'A polished, beginner-friendly distribution based on Ubuntu. Ships the Cinnamon desktop and focuses on an out-of-the-box experience.',
    url: 'https://linuxmint.com',
    basedOn: 'Ubuntu / Debian',
  },
  manjaro: {
    description:
      'A user-friendly, rolling-release distribution based on Arch Linux, with easier installation and curated, slightly delayed updates for stability.',
    url: 'https://manjaro.org',
    basedOn: 'Arch',
  },
  'pop!_os': {
    description:
      'Developed by System76, focused on developers, creators and gamers. Ships the COSMIC desktop and excellent hardware/GPU support.',
    url: 'https://pop.system76.com',
    basedOn: 'Ubuntu',
  },
  opensuse: {
    description:
      'A robust distribution available as rolling (Tumbleweed) or fixed (Leap). Famous for the YaST configuration tool and openQA testing.',
    url: 'https://www.opensuse.org',
  },
  endeavouros: {
    description:
      'A near-vanilla Arch experience with a friendly graphical installer. Closer to pure Arch than Manjaro, for users who want Arch with less setup.',
    url: 'https://endeavouros.com',
    basedOn: 'Arch',
  },
  'zorin os': {
    description:
      'Designed to ease the switch from Windows or macOS, with familiar layouts and a clean, accessible interface.',
    url: 'https://zorin.com/os',
    basedOn: 'Ubuntu',
  },
  nixos: {
    description:
      'A unique distribution built on the Nix package manager, offering fully declarative, reproducible system configuration and atomic upgrades/rollbacks.',
    url: 'https://nixos.org',
  },
  'kali linux': {
    description:
      'A Debian-based distribution focused on penetration testing and security auditing, bundling hundreds of security tools.',
    url: 'https://www.kali.org',
    basedOn: 'Debian',
  },
  'mx linux': {
    description:
      'A lightweight, stable distribution based on Debian, combining Xfce simplicity with handy MX Tools. Consistently popular on DistroWatch.',
    url: 'https://mxlinux.org',
    basedOn: 'Debian',
  },
  gentoo: {
    description:
      'A source-based, rolling-release distribution where packages are compiled and tuned for your hardware via the Portage system. Maximum control.',
    url: 'https://www.gentoo.org',
  },
  almalinux: {
    description:
      'A free, community-driven, 1:1 binary-compatible rebuild of Red Hat Enterprise Linux (RHEL), aimed at servers and production.',
    url: 'https://almalinux.org',
    basedOn: 'RHEL',
  },
  'rocky linux': {
    description:
      'An enterprise-grade distribution that is bug-for-bug compatible with RHEL, created by a CentOS co-founder as a community successor.',
    url: 'https://rockylinux.org',
    basedOn: 'RHEL',
  },
  lmde: {
    description:
      'Linux Mint Debian Edition — the Mint experience built directly on Debian instead of Ubuntu, as a fallback should Ubuntu ever disappear.',
    url: 'https://linuxmint.com/download_lmde.php',
    basedOn: 'Debian',
  },
  'garuda linux': {
    description:
      'A performance-oriented, rolling-release Arch derivative with the Zen kernel, gaming tooling and a striking out-of-the-box look.',
    url: 'https://garudalinux.org',
    basedOn: 'Arch',
  },
  elementary: {
    description:
      'A design-focused distribution with the bespoke Pantheon desktop, emphasizing a clean, macOS-like experience and a curated app store.',
    url: 'https://elementary.io',
    basedOn: 'Ubuntu',
  },
  centos: {
    description:
      'A community rebuild of RHEL (now CentOS Stream, the rolling upstream of RHEL), long a staple for servers.',
    url: 'https://www.centos.org',
    basedOn: 'RHEL',
  },
  slackware: {
    description:
      'The oldest actively maintained Linux distribution, prized for its simplicity, stability and traditional UNIX-like approach.',
    url: 'http://www.slackware.com',
  },
  void: {
    description:
      'An independent, rolling-release distribution with the runit init system and its own XBPS package manager. Lean and fast.',
    url: 'https://voidlinux.org',
  },
  artix: {
    description:
      'An Arch-based distribution without systemd, offering init alternatives like runit, OpenRC and s6.',
    url: 'https://artixlinux.org',
    basedOn: 'Arch',
  },
}

export function getDistroMeta(name: string): DistroMeta | null {
  const key = name.trim().toLowerCase()
  if (DISTROS[key]) return DISTROS[key]

  // Tolerant match: real names may include suffixes like "GNU/Linux" or "Linux".
  for (const [k, meta] of Object.entries(DISTROS)) {
    if (key.includes(k) || k.includes(key)) return meta
  }
  return null
}
