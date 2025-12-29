#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מנגנון סנכרון אוטומטי ל-GitHub
מסנכרן את כל השינויים מיידית וחכמה
"""

import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

def setup_encoding():
    """הגדרת encoding ל-UTF-8"""
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def run_command(cmd, check=True):
    """מריץ פקודת Git"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            encoding='utf-8',
            cwd=os.getcwd()
        )
        if result.stdout:
            print(result.stdout)
        if result.stderr and result.returncode != 0:
            print(f"[ERROR] {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"[ERROR] שגיאה בהרצת פקודה: {e}")
        return False

def check_git_status():
    """בודק את מצב Git"""
    print("\n" + "="*70)
    print("בודק מצב Git...")
    print("="*70 + "\n")
    
    # בדיקת remote
    if not run_command("git remote -v", check=False):
        print("[ERROR] אין remote מוגדר!")
        return False
    
    # בדיקת branch
    result = subprocess.run("git branch --show-current", shell=True, capture_output=True, text=True, encoding='utf-8')
    current_branch = result.stdout.strip()
    if not current_branch:
        print("[WARNING] לא נמצא branch פעיל - בודקים...")
        result = subprocess.run("git branch", shell=True, capture_output=True, text=True, encoding='utf-8')
        print(result.stdout)
        return False
    
    print(f"[OK] Branch פעיל: {current_branch}")
    
    # בדיקת שינויים
    result = subprocess.run("git status --short", shell=True, capture_output=True, text=True, encoding='utf-8')
    changes = result.stdout.strip()
    
    if changes:
        print(f"\n[INFO] נמצאו שינויים:")
        print(changes)
        return True
    else:
        print("\n[INFO] אין שינויים לסנכרן")
        return False

def sync_to_github(commit_message=None):
    """מסנכרן את כל השינויים ל-GitHub"""
    print("\n" + "="*70)
    print("מסנכרן ל-GitHub...")
    print("="*70 + "\n")
    
    # בדיקת הגנה לפני סנכרון
    print("בודק הגנה לפני סנכרון...")
    protect_result = subprocess.run(
        [sys.executable, "protect-all-files.py"],
        capture_output=True,
        text=True,
        encoding='utf-8'
    )
    
    if protect_result.returncode != 0:
        print("\n[ERROR] בדיקת הגנה נכשלה!")
        print(protect_result.stdout)
        return False
    
    print("[OK] בדיקת הגנה עברה\n")
    
    # קבלת branch נוכחי
    result = subprocess.run("git branch --show-current", shell=True, capture_output=True, text=True, encoding='utf-8')
    current_branch = result.stdout.strip() or "main"
    
    # הוספת כל הקבצים
    print("מוסיף קבצים...")
    if not run_command("git add ."):
        return False
    
    # יצירת commit
    if not commit_message:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_message = f"Auto-sync: {timestamp}"
    
    print(f"\nיוצר commit: {commit_message}")
    if not run_command(f'git commit -m "{commit_message}"'):
        print("[WARNING] אין שינויים חדשים ל-commit")
    
    # Push ל-GitHub
    print(f"\nדוחף ל-GitHub (branch: {current_branch})...")
    if not run_command(f"git push origin {current_branch}"):
        print("[ERROR] Push נכשל!")
        return False
    
    print("\n" + "="*70)
    print("[SUCCESS] הסנכרון הושלם בהצלחה!")
    print("="*70 + "\n")
    return True

def main():
    """פונקציה ראשית"""
    setup_encoding()
    
    print("\n" + "="*70)
    print("מנגנון סנכרון אוטומטי ל-GitHub")
    print("="*70)
    
    # בדיקת מצב
    has_changes = check_git_status()
    
    if not has_changes:
        print("\n[INFO] אין שינויים לסנכרן")
        return 0
    
    # סנכרון
    commit_message = None
    if len(sys.argv) > 1:
        commit_message = " ".join(sys.argv[1:])
    
    if sync_to_github(commit_message):
        return 0
    else:
        return 1

if __name__ == '__main__':
    sys.exit(main())

