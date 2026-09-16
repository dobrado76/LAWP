import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert ".append(" not in src, "build the list with a comprehension, not an append loop"

assert main.labels([12, 7, 19, 3, 22]) == ["12 mV", "19 mV", "22 mV"]
assert main.labels([1, 2]) == []
assert main.labels([]) == []
assert main.labels([11]) == ["11 mV"]
assert main.labels([10]) == [], "the threshold is above 10, not 10 or more"
