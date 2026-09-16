from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert src.count("with open") >= 2, "use a with block for the write as well as the read"
assert Path("count.txt").read_text(encoding="utf-8").strip() == "4", "count.txt should hold the line count"
