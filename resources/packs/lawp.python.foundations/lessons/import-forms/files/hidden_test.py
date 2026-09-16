from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "import station as st" in src, "expected your code to use " + "import station as st"
assert "from station import celsius" in src, "expected your code to use " + "from station import celsius"
