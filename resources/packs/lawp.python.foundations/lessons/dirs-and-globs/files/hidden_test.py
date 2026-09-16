from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "parents=True" in src, "one mkdir call should make the whole chain: parents=True"
assert "exist_ok=True" in src, "exist_ok=True keeps a second run from raising FileExistsError"
assert "rglob" in src, "rglob matches at every depth; glob only looks in one folder"
assert "sorted" in src, "sort the matches so every machine prints the same line"
assert Path("logs/north/day.log").is_file(), "logs/north/day.log should exist"
assert Path("logs/ridge/day.log").is_file(), "logs/ridge/day.log should exist"
