#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מנגנון הגנה אוטומטי - רץ לפני ואחרי כל שינוי
"""

import sys
import subprocess
from pathlib import Path

def setup_encoding():
    """הגדרת encoding ל-UTF-8"""
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def run_protection_check():
    """מריץ את בדיקת ההגנה"""
    protect_script = Path('protect-all-files.py')
    if not protect_script.exists():
        return False, "protect-all-files.py לא נמצא!"
    
    try:
        result = subprocess.run(
            [sys.executable, str(protect_script)],
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        return result.returncode == 0, result.stdout
    except Exception as e:
        return False, f"שגיאה בהרצת בדיקת הגנה: {e}"

def main():
    """פונקציה ראשית - בודקת את המערכת"""
    setup_encoding()
    
    print("\n" + "="*70)
    print("מנגנון הגנה אוטומטי - בדיקת תקינות")
    print("="*70 + "\n")
    
    is_ok, output = run_protection_check()
    
    if output:
        print(output)
    
    if is_ok:
        print("\n[SUCCESS] המערכת תקינה")
        return 0
    else:
        print("\n[ERROR] נמצאו בעיות - אל תמשיך לערוך!")
        return 1

if __name__ == '__main__':
    sys.exit(main())

