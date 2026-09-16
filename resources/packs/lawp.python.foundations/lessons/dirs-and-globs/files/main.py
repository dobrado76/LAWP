from pathlib import Path

found = sorted(Path(".").glob("*.log"))

print(" ".join(p.parent.name for p in found))
