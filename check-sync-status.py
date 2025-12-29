#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
בודק את מצב הסנכרון עם GitHub
"""

import subprocess
import sys
import os

def setup_encoding():
    """הגדרת encoding ל-UTF-8"""
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def run_command(cmd):
    """מריץ פקודה ומחזיר את הפלט"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            encoding='utf-8',
            cwd=os.getcwd()
        )
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def main():
    """פונקציה ראשית"""
    setup_encoding()
    
    print("\n" + "="*70)
    print("בודק מצב סנכרון עם GitHub")
    print("="*70 + "\n")
    
    # בדיקת remote
    ok, output, err = run_command("git remote -v")
    if ok and output:
        print("[OK] Remote מוגדר:")
        print(output)
    else:
        print("[ERROR] אין remote מוגדר!")
        return 1
    
    # בדיקת branch
    ok, branch, err = run_command("git branch --show-current")
    if ok and branch:
        print(f"\n[OK] Branch פעיל: {branch}")
    else:
        print("\n[WARNING] לא נמצא branch פעיל")
        ok, all_branches, err = run_command("git branch")
        if ok:
            print("Branches זמינים:")
            print(all_branches)
    
    # בדיקת user
    ok, email, err = run_command("git config user.email")
    if ok and email:
        print(f"\n[OK] User email: {email}")
        if email != "yanivmiz77@gmail.com":
            print(f"[WARNING] Email לא תואם! צריך להיות: yanivmiz77@gmail.com")
    else:
        print("\n[ERROR] User email לא מוגדר!")
    
    # בדיקת שינויים
    ok, status, err = run_command("git status --short")
    if ok:
        if status:
            print(f"\n[INFO] יש שינויים לסנכרן:")
            print(status)
        else:
            print("\n[OK] אין שינויים - הכל מסונכרן")
    
    # בדיקת מצב מול remote
    print("\nבודק מצב מול GitHub...")
    ok, ahead, err = run_command("git rev-list --count HEAD...origin/main 2>nul || git rev-list --count HEAD...origin/master 2>nul || echo 0")
    if ok:
        ahead_count = ahead.strip() if ahead.strip().isdigit() else "0"
        if ahead_count != "0":
            print(f"[INFO] יש {ahead_count} commits שלא נדחפו ל-GitHub")
        else:
            print("[OK] כל ה-commits מסונכרנים")
    
    ok, behind, err = run_command("git rev-list --count origin/main...HEAD 2>nul || git rev-list --count origin/master...HEAD 2>nul || echo 0")
    if ok:
        behind_count = behind.strip() if behind.strip().isdigit() else "0"
        if behind_count != "0":
            print(f"[INFO] יש {behind_count} commits ב-GitHub שלא כאן")
    
    print("\n" + "="*70)
    print("סיכום:")
    print("="*70)
    print("לסנכרן: python auto-sync-github.py")
    print("="*70 + "\n")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

