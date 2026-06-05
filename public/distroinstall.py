#!/usr/bin/env python3
"""
DistroInstall Detection Script
Detects system information and sends it to the API
"""

import platform
import distro
import psutil
import subprocess
import requests
import os

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


def get_desktop_environment():
    de = os.environ.get('DESKTOP_SESSION', '')
    if not de:
        de = os.environ.get('XDG_CURRENT_DESKTOP', '')
    return de or 'Unknown'


def get_gpu_info():
    try:
        result = subprocess.run(['lspci'], capture_output=True, text=True)
        gpu_lines = [line for line in result.stdout.split('\n') if 'VGA' in line or '3D' in line]
        return gpu_lines[0].split(': ')[1] if gpu_lines else 'Unknown'
    except Exception:
        return 'Unknown'


def get_cpu_model():
    # platform.processor() is usually empty on Linux; read the real model name.
    try:
        with open('/proc/cpuinfo') as f:
            for line in f:
                if line.startswith('model name'):
                    return line.split(':', 1)[1].strip()
    except Exception:
        pass
    return platform.processor() or 'Unknown'


def get_system_info():
    return {
        'distro_name': distro.name(),
        'distro_version': distro.version(),
        'distro_codename': distro.codename(),
        'kernel': platform.release(),
        'architecture': platform.machine(),
        'desktop_environment': get_desktop_environment(),
        'cpu': get_cpu_model(),
        'cpu_cores': psutil.cpu_count(logical=False),
        'cpu_threads': psutil.cpu_count(logical=True),
        'ram_gb': round(psutil.virtual_memory().total / (1024**3), 2),
        'gpu': get_gpu_info(),
    }


def send_to_api(data, token=None, is_virtual=None, usage_type=None):
    payload = {
        'system_info': data,
        'token': token,
        'is_virtual': is_virtual,
        'usage_type': usage_type,
    }
    try:
        response = requests.post(API_URL, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error sending data: {e}")
        return None


def main():
    print("🐧 DistroInstall - System Detector\n")

    is_virtual = input("Is this a virtual machine? (y/n): ").lower() == 'y'

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
        print(f"\n🔑 Saved token found: {existing_token[:24]}...")
        use_existing = input("Use this token? (Y/n): ").strip().lower()
        token = existing_token if use_existing != 'n' else None
    else:
        print("\n🔑 User token (optional):")
        print(f"   Find it at your dashboard → {BASE_URL}/dashboard")
        raw = input("   Token (Enter to submit anonymously): ").strip()
        token = raw if raw else None

    print("\n🔍 Collecting system information...")
    system_info = get_system_info()

    print(f"\n📊 Summary:")
    print(f"  Distro:  {system_info['distro_name']} {system_info['distro_version']}")
    print(f"  Kernel:  {system_info['kernel']}")
    print(f"  DE:      {system_info['desktop_environment']}")
    print(f"  CPU:     {system_info['cpu']} ({system_info['cpu_cores']} cores)")
    print(f"  RAM:     {system_info['ram_gb']} GB")
    print(f"  GPU:     {system_info['gpu']}")

    confirm = input("\nSend this data? (Y/n): ").strip().lower()
    if confirm == 'n':
        print("Cancelled.")
        return

    print("\n📤 Sending data...")
    result = send_to_api(system_info, token, is_virtual, usage_type)

    if result:
        if token and token.startswith('usr_'):
            save_token(token)
            print(f"\n✅ Data sent and linked to your account!")
            print(f"🌐 Your dashboard: {BASE_URL}/dashboard")
            print(f"\n💡 Personal token saved to {TOKEN_FILE}")
        elif result.get('token'):
            new_token = result['token']
            save_token(new_token)
            print(f"\n✅ Data sent!")
            print(f"🌐 Your profile: {BASE_URL}/u/{new_token}")
            print(f"\n💡 Token saved to {TOKEN_FILE}")
            print(f"   It will be loaded automatically next time.")


if __name__ == '__main__':
    main()
