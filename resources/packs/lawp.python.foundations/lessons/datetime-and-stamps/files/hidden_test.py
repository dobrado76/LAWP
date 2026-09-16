from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "fromisoformat" in src, "parse the stamp instead of slicing digits out of the string"
assert "timedelta" in src, "a shift in time is a timedelta"
assert ".isoformat()" in src, "print the stamp back out with .isoformat()"
assert "now()" not in src, "a graded task must not read the clock"
