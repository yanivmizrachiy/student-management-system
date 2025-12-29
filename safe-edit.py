#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט לעריכה בטוחה - בודק לפני ואחרי שינויים
"""

import sys
import subprocess
from pathlib import Path

def run_protection_check():
    """מריץ את בדיקת ההגנה"""
    protect_script = Path('protect-all-files.py')
    if not protect_script.exists():
        print("[ERROR] protect-all-files.py לא נמצא!")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, str(protect_script)],
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"[ERROR] שגיאה בהרצת בדיקת הגנה: {e}")
        return False

def main():
    """פונקציה ראשית"""
    # הגדרת encoding ל-UTF-8
    import sys
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    print("\n" + "="*70)
    print("עריכה בטוחה - בדיקה לפני שינויים")
    print("="*70 + "\n")
    
    if len(sys.argv) < 2:
        print("שימוש: python safe-edit.py [before|after]")
        print("  before - בדיקה לפני שינוי")
        print("  after  - בדיקה אחרי שינוי")
        return 1
    
    mode = sys.argv[1].lower()
    
    if mode == 'before':
        print("בודק את המצב הנוכחי לפני שינוי...\n")
        if run_protection_check():
            print("\n[SUCCESS] המערכת תקינה - ניתן לבצע שינויים")
            return 0
        else:
            print("\n[ERROR] נמצאו בעיות - אל תמשיך לערוך!")
            return 1
    
    elif mode == 'after':
        print("בודק את המצב אחרי שינוי...\n")
        if run_protection_check():
            print("\n[SUCCESS] השינויים לא שברו כלום - הכל תקין!")
            return 0
        else:
            print("\n[ERROR] השינויים שברו משהו - צריך לתקן!")
            return 1
    
    else:
        print(f"[ERROR] מצב לא ידוע: {mode}")
        print("שימוש: python safe-edit.py [before|after]")
        return 1

if __name__ == '__main__':
    sys.exit(main())

