#!/usr/bin/env python3
"""
DistroInstall Detection Script
Detecta información del sistema y la envía a la API
"""

import platform
import distro
import psutil
import subprocess
import json
import requests
import os

API_URL = 'https://distroinstall.vercel.app/api/submit'
BASE_URL = 'https://distroinstall.vercel.app'
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


def get_system_info():
    return {
        'distro_name': distro.name(),
        'distro_version': distro.version(),
        'distro_codename': distro.codename(),
        'kernel': platform.release(),
        'architecture': platform.machine(),
        'desktop_environment': get_desktop_environment(),
        'cpu': platform.processor(),
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
        print(f"❌ Error al enviar datos: {e}")
        return None


def main():
    print("🐧 DistroInstall - Detector de Sistema\n")

    # Máquina virtual o física
    is_virtual = input("¿Es una máquina virtual? (s/n): ").lower() == 's'

    # Tipo de uso
    print("\nTipo de uso:")
    print("1. Escritorio/Personal")
    print("2. Programación/Desarrollo")
    print("3. Gaming")
    print("4. Servidor")
    print("5. Otro")
    usage_choice = input("Selecciona (1-5): ")
    usage_types = {'1': 'desktop', '2': 'programming', '3': 'gaming', '4': 'server', '5': 'other'}
    usage_type = usage_types.get(usage_choice, 'other')

    # Token — carga automáticamente si existe, si no, pregunta
    existing_token = load_token()
    if existing_token:
        print(f"\n🔑 Token guardado encontrado: {existing_token[:24]}...")
        use_existing = input("¿Usar este token? (Y/n): ").strip().lower()
        token = existing_token if use_existing != 'n' else None
    else:
        print("\n🔑 Token de usuario (opcional):")
        print("   Encuéntralo en tu dashboard → distroinstall.vercel.app/dashboard")
        raw = input("   Token (Enter para anónimo): ").strip()
        token = raw if raw else None

    # Recopilar info
    print("\n🔍 Recopilando información del sistema...")
    system_info = get_system_info()

    print(f"\n📊 Resumen:")
    print(f"  Distro:  {system_info['distro_name']} {system_info['distro_version']}")
    print(f"  Kernel:  {system_info['kernel']}")
    print(f"  DE:      {system_info['desktop_environment']}")
    print(f"  CPU:     {system_info['cpu']} ({system_info['cpu_cores']} cores)")
    print(f"  RAM:     {system_info['ram_gb']} GB")
    print(f"  GPU:     {system_info['gpu']}")

    confirm = input("\n¿Enviar estos datos? (Y/n): ").strip().lower()
    if confirm == 'n':
        print("Cancelado.")
        return

    print("\n📤 Enviando datos...")
    result = send_to_api(system_info, token, is_virtual, usage_type)

    if result:
        # Si usamos un token personal (usr_), siempre lo conservamos
        if token and token.startswith('usr_'):
            save_token(token)
            print(f"\n✅ ¡Datos enviados y vinculados a tu cuenta!")
            print(f"🌐 Tu dashboard: {BASE_URL}/dashboard")
            print(f"\n💡 Token personal guardado en {TOKEN_FILE}")
        elif result.get('token'):
            new_token = result['token']
            save_token(new_token)
            print(f"\n✅ ¡Datos enviados!")
            print(f"🌐 Tu perfil: {BASE_URL}/u/{new_token}")
            print(f"\n💡 Token guardado en {TOKEN_FILE}")
            print(f"   La próxima vez se cargará automáticamente.")


if __name__ == '__main__':
    main()
