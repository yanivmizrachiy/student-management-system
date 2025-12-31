#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מנגנון שמירה על שרת חי וסנכרון אוטומטי
מוודא שהשרת תמיד רץ והכל מסונכרן ל-GitHub
"""

import subprocess
import sys
import os
import time
import socket
from pathlib import Path

def setup_encoding():
    """הגדרת encoding ל-UTF-8"""
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def check_port(port):
    """בודק אם פורט פתוח"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result == 0
    except:
        return False

def start_server():
    """מתחיל את השרת המקומי"""
    print("\n" + "="*70)
    print("מתחיל שרת מקומי...")
    print("="*70 + "\n")
    
    server_script = Path("server.py")
    if not server_script.exists():
        print("[ERROR] server.py לא נמצא!")
        return None
    
    try:
        # הרצת השרת ברקע
        process = subprocess.Popen(
            [sys.executable, str(server_script)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == 'win32' else 0
        )
        print(f"[OK] שרת התחיל (PID: {process.pid})")
        print(f"[INFO] האתר זמין ב: http://localhost:8000")
        return process
    except Exception as e:
        print(f"[ERROR] שגיאה בהרצת השרת: {e}")
        return None

def sync_to_github():
    """מסנכרן ל-GitHub"""
    print("\n" + "="*70)
    print("מסנכרן ל-GitHub...")
    print("="*70 + "\n")
    
    sync_script = Path("auto-sync-github.py")
    if not sync_script.exists():
        print("[WARNING] auto-sync-github.py לא נמצא - מדלג על סנכרון")
        return True
    
    try:
        result = subprocess.run(
            [sys.executable, str(sync_script)],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        
        if result.stdout:
            print(result.stdout)
        if result.stderr and result.returncode != 0:
            print(f"[WARNING] {result.stderr}")
        
        return result.returncode == 0
    except Exception as e:
        print(f"[ERROR] שגיאה בסנכרון: {e}")
        return False

def main():
    """פונקציה ראשית"""
    setup_encoding()
    
    print("\n" + "="*70)
    print("מנגנון שמירה על שרת חי וסנכרון אוטומטי")
    print("="*70)
    
    # בדיקת מצב סנכרון
    print("\nבודק מצב סנכרון...")
    sync_to_github()
    
    # בדיקת שרת
    PORT = 8000
    if check_port(PORT):
        print(f"\n[OK] שרת כבר רץ על פורט {PORT}")
        print(f"[INFO] האתר זמין ב: http://localhost:{PORT}")
    else:
        print(f"\n[INFO] שרת לא רץ - מתחיל...")
        process = start_server()
        if process:
            # המתן קצת שהשרת יתחיל
            time.sleep(2)
            if check_port(PORT):
                print(f"[OK] שרת רץ בהצלחה!")
            else:
                print(f"[WARNING] שרת התחיל אבל פורט {PORT} עדיין לא זמין")
    
    print("\n" + "="*70)
    print("[SUCCESS] הכל מוכן!")
    print("="*70)
    print(f"🌐 האתר: http://localhost:{PORT}")
    print("🔄 סנכרון: מסונכרן ל-GitHub")
    print("="*70 + "\n")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())


