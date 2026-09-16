from pathlib import Path

expected = [
    "06:12 fox ne ok",
    "06:40 fox e drift",
    "07:05 grid ping ok",
    "07:31 fox s drift",
]

lines = Path("report.txt").read_text(encoding="utf-8").splitlines()
assert lines == expected, "report.txt should hold the four cleaned lines, one per line, but holds " + repr(lines)
