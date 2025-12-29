#!/usr/bin/env python3
"""Pre-commit helper that enforces safety checks for all critical files."""

from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parent.parent
PROTECT_ALL_SCRIPT = ROOT / "protect-all-files.py"
PROTECT_LAYER_SCRIPT = ROOT / "protect-layer-html.py"
LAYER_FILE = ROOT / "layer.html"


def run_command(args):
    try:
        result = subprocess.run(args, check=True, capture_output=True, text=True, encoding='utf-8')
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(e.stdout)
        if e.stderr:
            print(e.stderr)
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

