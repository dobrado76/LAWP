from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "import station" in src, "expected your code to use " + "import station"
assert "station.label()" in src, "expected your code to use " + "station.label()"
