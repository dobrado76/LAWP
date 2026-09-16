import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "else:" in src, "use the else block for the success-only note"
assert "finally:" in src, "use the finally block for the note that always runs"

good = []
assert main.parse_with_report("12", good) == 12
assert good == ["ok", "closed"]

bad = []
assert main.parse_with_report("warm", bad) == 0
assert bad == ["failed", "closed"]
