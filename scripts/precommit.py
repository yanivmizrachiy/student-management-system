#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pre-commit helper that enforces safety checks for all critical files."""

from pathlib import Path
import subprocess
import sys
import io
import os

# הגדרת encoding ל-UTF-8 בתחילת הקובץ - לפני כל דבר אחר
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    # גם עבור subprocess
    os.environ['PYTHONIOENCODING'] = 'utf-8'

ROOT = Path(__file__).resolve().parent.parent
PROTECT_ALL_SCRIPT = ROOT / "protect-all-files.py"
PROTECT_LAYER_SCRIPT = ROOT / "protect-layer-html.py"
LAYER_FILE = ROOT / "layer.html"


def safe_print(text):
    """הדפסה בטוחה עם encoding"""
    if not text:
        return
    try:
        print(text)
    except (UnicodeEncodeError, UnicodeDecodeError):
        # Fallback - הדפסה בטוחה
        safe_text = text.encode('ascii', errors='replace').decode('ascii', errors='replace')
        print(safe_text)


def run_command(args):
    try:
        result = subprocess.run(
            args, 
            check=True, 
            capture_output=True, 
            text=True, 
            encoding='utf-8',
            errors='replace',
            env=os.environ.copy()
        )
        if result.stdout:
            safe_print(result.stdout)
        if result.stderr:
            safe_print(result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        if e.stdout:
            safe_print(e.stdout)
        if e.stderr:
            safe_print(e.stderr)
        return False


def main():
    print("\n" + "="*70)
    print("Running automated pre-commit checks...")
    print("="*70 + "\n")
    
    # בדיקה כללית של כל הקבצים
    if PROTECT_ALL_SCRIPT.exists():
        print("Checking all critical files...")
        if not run_command([sys.executable, str(PROTECT_ALL_SCRIPT)]):
            print("\n[ERROR] protect-all-files.py failed. Aborting commit.")
            sys.exit(1)
    else:
        print(f"[WARNING] {PROTECT_ALL_SCRIPT.name} not found. Skipping full check.")
    
    # בדיקה ספציפית של layer.html
    if LAYER_FILE.exists() and PROTECT_LAYER_SCRIPT.exists():
        print("\nChecking layer.html specifically...")
        if not run_command([sys.executable, str(PROTECT_LAYER_SCRIPT), str(LAYER_FILE)]):
            print("\n[ERROR] protect-layer-html.py failed. Aborting commit.")
            sys.exit(1)
    
    print("\n" + "="*70)
    print("[SUCCESS] All automated checks passed.")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
