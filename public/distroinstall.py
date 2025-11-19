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

def get_desktop_environment():
    """Detecta el entorno de escritorio"""
    de = os.environ.get('DESKTOP_SESSION', '')
    if not de:
        de = os.environ.get('XDG_CURRENT_DESKTOP', '')
    return de or 'Unknown'

def get_gpu_info():
    """Obtiene información de GPU"""
    try:
        result = subprocess.run(['lspci'], capture_output=True, text=True)
        gpu_lines = [line for line in result.stdout.split('\n') if 'VGA' in line or '3D' in line]
        return gpu_lines[0].split(': ')[1] if gpu_lines else 'Unknown'
    except:
        return 'Unknown'

def get_system_info():
    """Recopila toda la información del sistema"""
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
    """Envía los datos a la API de DistroInstall"""
    # api_url = 'https://distroinstall.vercel.app/api/submit'
    # Línea ~57, cambia la URL:
    api_url = 'http://localhost:3000/api/submit'
    
    payload = {
        'system_info': data,
        'token': token,
        'is_virtual': is_virtual,
        'usage_type': usage_type
    }
    
    try:
        response = requests.post(api_url, json=payload, timeout=10)
        response.raise_for_status()
        result = response.json()
        print(f"\n✅ Datos enviados exitosamente!")
        print(f"🔑 Token: {result.get('token', 'N/A')}")
        print(f"\n💾 Guarda este token para futuras submissions")
        return result
    except requests.exceptions.RequestException as e:
        print(f"❌ Error al enviar datos: {e}")
        return None

def main():
    """Función principal"""
    print("🐧 DistroInstall - Detector de Sistema\n")
    
    # Preguntar si es virtual o físico
    is_virtual = input("¿Es una máquina virtual? (s/n): ").lower() == 's'
    
    # Preguntar tipo de uso
    print("\nTipo de uso:")
    print("1. Escritorio/Personal")
    print("2. Programación/Desarrollo")
    print("3. Gaming")
    print("4. Servidor")
    print("5. Otro")
    usage_choice = input("Selecciona (1-5): ")
    
    usage_types = {
        '1': 'desktop',
        '2': 'programming',
        '3': 'gaming',
        '4': 'server',
        '5': 'other'
    }
    usage_type = usage_types.get(usage_choice, 'other')
    
    # Recopilar información
    print("\n🔍 Recopilando información del sistema...")
    system_info = get_system_info()
    
    # Mostrar resumen
    print(f"\n📊 Resumen:")
    print(f"Distro: {system_info['distro_name']} {system_info['distro_version']}")
    print(f"Kernel: {system_info['kernel']}")
    print(f"DE: {system_info['desktop_environment']}")
    print(f"RAM: {system_info['ram_gb']} GB")
    
    # Preguntar si tiene token
    token = input("\n¿Tienes un token de usuario? (Enter para anónimo): ").strip()
    token = token if token else None
    
    # Enviar a la API
    print("\n📤 Enviando datos...")
    send_to_api(system_info, token, is_virtual, usage_type)

if __name__ == '__main__':
    main()