import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "except:" not in src, "catch the error you expect, not a bare except"

assert main.to_int("12") == 12
assert main.to_int("  7  ") == 7
assert main.to_int("warm", -1) == -1
assert main.to_int(None, 0) == 0
assert main.to_int("", 5) == 5
assert main.to_int("12", -1) == 12
