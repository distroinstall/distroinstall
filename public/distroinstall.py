#!/usr/bin/env python3
"""
DistroInstall Detection Script
Detects system information and sends it to the API.

Zero dependencies - uses only the Python standard library, so it runs on any
system with python3 (no pip, no virtualenv, no PEP 668 headaches).
"""

import json
import os
import sys
import platform
import subprocess
import urllib.request
import urllib.error

API_URL = 'https://distroinstall.com/api/submit'
BASE_URL = 'https://distroinstall.com'
TOKEN_FILE = os.path.expanduser('~/.distroinstall_token')


def load_token():
    if os.path.exists(TOKEN_FILE):
        token = open(TOKEN_FILE).read().strip()
        return token if token else None
    return None


def save_token(token):
    with open(TOKEN_FILE, 'w') as f:
        f.write(token)


def read_os_release():
    data = {}
    try:
        with open('/etc/os-release') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    k, v = line.split('=', 1)
                    data[k] = v.strip().strip('"')
    except Exception:
        pass
    return data


def get_desktop_environment():
    de = os.environ.get('XDG_CURRENT_DESKTOP', '') or os.environ.get('DESKTOP_SESSION', '')
    return de or 'Unknown'


def clean_gpu_name(raw):
    # lspci gives very long strings like:
    #   "Advanced Micro Devices, Inc. [AMD/ATI] Navi 32 [Radeon RX 7700 XT / 7800 XT] (rev c8)"
    # The friendly model is usually inside the last [...]; keep that and drop "(rev xx)".
    import re
    name = re.sub(r'\s*\(rev [^)]+\)\s*$', '', raw).strip()
    brackets = re.findall(r'\[([^\]]+)\]', name)
    if brackets:
        candidate = brackets[-1].strip()
        # Skip vendor tags like "AMD/ATI"; prefer a real model name.
        if candidate and candidate.upper() not in ('AMD/ATI',):
            return candidate
    # No useful model in brackets - strip common vendor prefixes/tags.
    for prefix in (
        'Advanced Micro Devices, Inc. [AMD/ATI] ',
        'Advanced Micro Devices, Inc. ',
        'Intel Corporation ',
        'NVIDIA Corporation ',
        '[AMD/ATI] ',
    ):
        if name.startswith(prefix):
            name = name[len(prefix):]
            break
    return name.strip() or 'Unknown'


def get_gpu_info():
    try:
        result = subprocess.run(['lspci'], capture_output=True, text=True)
        gpu_lines = [l for l in result.stdout.split('\n') if 'VGA' in l or '3D' in l]
        if not gpu_lines:
            return 'Unknown'
        return clean_gpu_name(gpu_lines[0].split(': ', 1)[1])
    except Exception:
        return 'Unknown'


def get_cpu_model():
    try:
        with open('/proc/cpuinfo') as f:
            for line in f:
                if line.startswith('model name'):
                    return line.split(':', 1)[1].strip()
    except Exception:
        pass
    return platform.processor() or 'Unknown'


def get_cpu_counts():
    """(physical_cores, logical_threads) from /proc/cpuinfo, with fallbacks."""
    threads = os.cpu_count() or 0
    physical = 0
    try:
        with open('/proc/cpuinfo') as f:
            text = f.read()
        pairs = set()
        cores_val = None
        for block in text.split('\n\n'):
            phys = core = None
            for line in block.split('\n'):
                if line.startswith('physical id'):
                    phys = line.split(':', 1)[1].strip()
                elif line.startswith('core id'):
                    core = line.split(':', 1)[1].strip()
                elif line.startswith('cpu cores'):
                    cores_val = line.split(':', 1)[1].strip()
            if phys is not None and core is not None:
                pairs.add((phys, core))
        if pairs:
            physical = len(pairs)
        elif cores_val:
            physical = int(cores_val)
    except Exception:
        pass
    return (physical or threads), threads


def get_ram_gb():
    try:
        with open('/proc/meminfo') as f:
            for line in f:
                if line.startswith('MemTotal'):
                    kb = int(line.split()[1])
                    return round(kb / 1024 / 1024, 2)
    except Exception:
        pass
    return 0


def detect_virtual():
    """Best-effort VM detection via systemd-detect-virt; returns True/False/None."""
    try:
        r = subprocess.run(['systemd-detect-virt'], capture_output=True, text=True)
        out = r.stdout.strip()
        if out:
            return out != 'none'
    except Exception:
        pass
    return None


def get_system_info():
    osr = read_os_release()
    cores, threads = get_cpu_counts()
    return {
        'distro_name': osr.get('NAME') or platform.system() or 'Unknown',
        'distro_version': osr.get('VERSION_ID') or osr.get('BUILD_ID') or 'rolling',
        'distro_codename': osr.get('VERSION_CODENAME', ''),
        'kernel': platform.release(),
        'architecture': platform.machine(),
        'desktop_environment': get_desktop_environment(),
        'cpu': get_cpu_model(),
        'cpu_cores': cores,
        'cpu_threads': threads,
        'ram_gb': get_ram_gb(),
        'gpu': get_gpu_info(),
    }


def build_payload(data, token=None, is_virtual=None, usage_type=None):
    """The exact JSON body that gets POSTed. Used for both sending and --dry-run,
    so the preview is guaranteed identical to what would be sent."""
    return {
        'system_info': data,
        'token': token,
        'is_virtual': is_virtual,
        'usage_type': usage_type,
    }


def send_to_api(data, token=None, is_virtual=None, usage_type=None):
    payload = json.dumps(build_payload(data, token, is_virtual, usage_type)).encode('utf-8')
    req = urllib.request.Request(
        API_URL, data=payload,
        headers={'Content-Type': 'application/json'}, method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Error sending data: HTTP {e.code} {e.reason}")
    except Exception as e:
        print(f"Error sending data: {e}")
    return None


def print_help():
    print("Usage: python3 distroinstall.py [options]")
    print()
    print("Options:")
    print("  --dry-run, -n   Collect your system info and print the EXACT JSON that")
    print("                  would be sent, then exit WITHOUT sending anything.")
    print("  --help, -h      Show this help and exit.")


def main():
    if '--help' in sys.argv or '-h' in sys.argv:
        print_help()
        return

    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv

    print(">_ DistroInstall - System Detector")
    if dry_run:
        print("   DRY RUN: this is a preview. Nothing will be sent.")
    print()

    default_vm = detect_virtual()  # True / False / None (unknown)
    if default_vm is None:
        default_vm = False
    suffix = 'Y/n' if default_vm else 'y/N'  # capital = default when Enter is pressed
    ans = input(f"Is this a virtual machine? ({suffix}): ").strip().lower()
    if ans == '':
        is_virtual = default_vm
    else:
        is_virtual = ans.startswith('y')

    print("\nUsage type:")
    print("1. Desktop/Personal")
    print("2. Programming/Development")
    print("3. Gaming")
    print("4. Server")
    print("5. Other")
    usage_choice = input("Select (1-5): ")
    usage_types = {'1': 'desktop', '2': 'programming', '3': 'gaming', '4': 'server', '5': 'other'}
    usage_type = usage_types.get(usage_choice, 'other')

    existing_token = load_token()
    if existing_token:
        print(f"\nSaved token found: {existing_token[:24]}...")
        use_existing = input("Use this token? (Y/n): ").strip().lower()
        token = existing_token if use_existing != 'n' else None
    else:
        print("\nUser token (optional):")
        print(f"   Find it at your dashboard -> {BASE_URL}/dashboard")
        raw = input("   Token (Enter to submit anonymously): ").strip()
        token = raw if raw else None

    print("\n==> Collecting system information...")
    system_info = get_system_info()

    print("\nSummary:")
    print(f"  Distro:  {system_info['distro_name']} {system_info['distro_version']}")
    print(f"  Kernel:  {system_info['kernel']}")
    print(f"  DE:      {system_info['desktop_environment']}")
    print(f"  CPU:     {system_info['cpu']} ({system_info['cpu_cores']} cores / {system_info['cpu_threads']} threads)")
    print(f"  RAM:     {system_info['ram_gb']} GB")
    print(f"  GPU:     {system_info['gpu']}")

    if dry_run:
        payload = build_payload(system_info, token, is_virtual, usage_type)
        # Mask the token in the preview so the output is safe to share publicly;
        # the real token is still what gets sent on an actual run.
        display = dict(payload)
        if token:
            display['token'] = token[:8] + '... (hidden in preview; sent unchanged)'
        print("\n==> Dry run: this is the EXACT JSON that would be POSTed to")
        print(f"    {API_URL}\n")
        print(json.dumps(display, indent=2))
        print("\n[dry-run] Nothing was sent. Re-run without --dry-run to submit.")
        if token:
            print("Your token is masked above, so this output is safe to share.")
        return

    confirm = input("\nSend this data? (Y/n): ").strip().lower()
    if confirm == 'n':
        print("Cancelled.")
        return

    print("\n==> Sending data...")
    result = send_to_api(system_info, token, is_virtual, usage_type)

    if result:
        if token and token.startswith('usr_'):
            save_token(token)
            print("\n[ok] Data sent and linked to your account!")
            print(f"     Your dashboard: {BASE_URL}/dashboard")
            print(f"\nPersonal token saved to {TOKEN_FILE}")
        elif result.get('token'):
            new_token = result['token']
            save_token(new_token)
            print("\n[ok] Data sent!")
            print(f"     Your profile: {BASE_URL}/u/{new_token}")
            print(f"\nToken saved to {TOKEN_FILE}")
            print("   It will be loaded automatically next time.")


if __name__ == '__main__':
    main()
