import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "try:" in src, "this lesson wants the try/except shape"
assert "except:" not in src, "name the errors you expect"

assert main.as_number("12.5") == 12.5
assert main.as_number(7) == 7.0
assert main.as_number("warm") is None
assert main.as_number(None) is None
assert main.as_number("") is None

assert main.first_reading({"north": [4, 5]}, "north") == 4
assert main.first_reading({"north": []}, "north") is None
assert main.first_reading({}, "south") is None
