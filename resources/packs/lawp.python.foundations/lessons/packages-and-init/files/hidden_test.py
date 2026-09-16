from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "from station import line" in src, "expected your code to use " + "from station import line"
assert "line(\"wind\")" in src, "expected your code to use " + "line(\"wind\")"
