from pathlib import Path

script = Path(__file__).resolve().parent.parent / "auto-load-data.js"
content = script.read_text(encoding="utf-8")
if "נורית מויאל" not in content:
    raise SystemExit("נורית מויאל not found")
print("found nurit entry")

