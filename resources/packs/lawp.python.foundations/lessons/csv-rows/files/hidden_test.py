from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "DictReader" in src, "let csv.DictReader split the row and name the columns"
assert '.split(",")' not in src, "a quoted field can hold a comma, so never split a row on commas"
