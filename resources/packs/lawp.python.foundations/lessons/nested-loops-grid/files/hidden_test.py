import json
from pathlib import Path

log = json.loads(Path("play-log.json").read_text(encoding="utf-8"))
assert isinstance(log, list) and log, "expected play commands"
assert not any(row.get("op") == "fault" for row in log), "play log has a fault"
src = Path("main.py").read_text(encoding="utf-8")
assert src.count("for ") >= 2, "use one loop inside another"
assert len(log) >= 20, "sweep every row instead of cutting the corner"
