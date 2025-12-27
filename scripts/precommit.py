#!/usr/bin/env python3
"""Pre-commit helper that enforces layer.html safety checks."""

from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parent.parent
LAYER_FILE = ROOT / "layer.html"
PROTECT_SCRIPT = ROOT / "protect-layer-html.py"


def run_command(args):
    try:
        subprocess.run(args, check=True)
        return True
    except subprocess.CalledProcessError:
        return False


def main():
    print("\nRunning automated pre-commit checks...")
    if not LAYER_FILE.exists():
        print(f"ERROR: {LAYER_FILE.name} missing.")
        sys.exit(1)
    if not PROTECT_SCRIPT.exists():
        print(f"ERROR: {PROTECT_SCRIPT.name} missing.")
        sys.exit(1)

    if not run_command([sys.executable, str(PROTECT_SCRIPT), str(LAYER_FILE)]):
        print("Protect script failed. Aborting commit.")
        sys.exit(1)

    print("All automated checks passed.")


if __name__ == "__main__":
    main()

