import json
from pathlib import Path

log = json.loads(Path("play-log.json").read_text(encoding="utf-8"))
assert isinstance(log, list) and log, "expected play commands"
assert not any(row.get("op") == "fault" for row in log), "play log has a fault"

