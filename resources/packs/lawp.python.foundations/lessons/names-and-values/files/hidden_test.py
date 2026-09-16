from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "total" in src, "expected your code to use " + "total"
