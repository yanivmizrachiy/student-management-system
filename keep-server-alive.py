# -*- coding: utf-8 -*-
"""
Keep Server Alive - שומר שהשרת תמיד רץ
בודק כל 5 שניות אם השרת רץ, ואם לא - מפעיל אותו מחדש
"""
import subprocess
import time
import os
import sys
import socket
import psutil
from pathlib import Path

PORT = 8000
SERVER_SCRIPT = "server.py"
PROJECT_DIR = Path(__file__).parent.absolute()

def is_port_in_use(port):
    """בודק אם פורט מסוים תפוס"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False
        except OSError:
            return True

def is_server_running():
    """בודק אם השרת רץ על ידי בדיקת פורט"""
    if not is_port_in_use(PORT):
        return False
    
    # בודק אם יש תהליך Python שרץ את server.py
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmdline = proc.info.get('cmdline', [])
                if cmdline and any('server.py' in str(arg) for arg in cmdline):
                    # בודק אם זה רץ מהתיקייה הנכונה
                    cwd = proc.cwd()
                    if str(PROJECT_DIR) in str(cwd):
                        return True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
    except Exception:
        pass
    
    return False

def start_server():
    """מפעיל את השרת"""
    try:
        os.chdir(PROJECT_DIR)
        # הפעל את השרת ברקע
        if sys.platform == 'win32':
            # Windows
            subprocess.Popen(
                [sys.executable, SERVER_SCRIPT],
                cwd=PROJECT_DIR,
                creationflags=subprocess.CREATE_NEW_CONSOLE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        else:
            # Linux/Mac
            subprocess.Popen(
                [sys.executable, SERVER_SCRIPT],
                cwd=PROJECT_DIR,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        print(f"✅ השרת הופעל מחדש ב-{time.strftime('%H:%M:%S')}")
        return True
    except Exception as e:
        print(f"❌ שגיאה בהפעלת השרת: {e}")
        return False

def open_browser():
    """פותח את הדפדפן עם האתר"""
    import webbrowser
    url = f"http://localhost:{PORT}/index.html"
    try:
        webbrowser.open(url)
        print(f"🌐 נפתח דפדפן עם {url}")
    except Exception as e:
        print(f"❌ שגיאה בפתיחת דפדפן: {e}")

def main():
    print("="*60)
    print("🔄 Keep Server Alive - שומר שהשרת תמיד רץ")
    print("="*60)
    print(f"📁 תיקיית פרויקט: {PROJECT_DIR}")
    print(f"🌐 כתובת: http://localhost:{PORT}")
    print("="*60)
    print("הסקריפט בודק כל 5 שניות אם השרת רץ")
    print("לעצירה לחץ Ctrl+C\n")
    
    # פתיחת דפדפן ראשונית
    browser_opened = False
    
    while True:
        try:
            if not is_server_running():
                print(f"⚠️  השרת לא רץ - מפעיל מחדש... ({time.strftime('%H:%M:%S')})")
                if start_server():
                    # המתן קצת שהשרת יתחיל
                    time.sleep(3)
                    if not browser_opened:
                        open_browser()
                        browser_opened = True
                else:
                    print("❌ נכשל בהפעלת השרת, אנסה שוב בעוד 10 שניות...")
                    time.sleep(10)
                    continue
            else:
                if not browser_opened:
                    # פתח דפדפן אם עדיין לא נפתח
                    time.sleep(2)
                    open_browser()
                    browser_opened = True
            
            # המתן 5 שניות לפני הבדיקה הבאה
            time.sleep(5)
            
        except KeyboardInterrupt:
            print("\n\n🛑 עצירת הסקריפט...")
            break
        except Exception as e:
            print(f"❌ שגיאה: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
