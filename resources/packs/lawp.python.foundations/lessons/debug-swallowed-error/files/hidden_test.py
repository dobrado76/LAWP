import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "except:" not in src, "narrow the bare except to the error you expect"

assert main.total_readings(main.ROWS) == 19
assert main.skipped(main.ROWS) == 1
assert main.total_readings([{"zone": "west", "reading": "5"}]) == 5
assert main.total_readings([]) == 0
assert main.skipped([]) == 0
assert main.skipped([{"zone": "west", "reading": "damp"}]) == 1
