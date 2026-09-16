from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "sys.argv[1]" in src, "the station comes from the command line"
assert "DictReader" in src, "a note field holds a comma, so let csv.DictReader split the row"

import main

assert main.summarise("records.csv", "creek") == (1, 5), "creek has one row, drift 5"
assert main.summarise("records.csv", "north") == (1, 0), "north has one row, drift 0"
assert main.summarise("records.csv", "hollow") == (0, 0), "a station with no rows is (0, 0)"
