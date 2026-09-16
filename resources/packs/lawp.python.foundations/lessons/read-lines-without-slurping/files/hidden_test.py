from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert ".read()" not in src, "walk the file line by line instead of reading all of it at once"
assert ".readlines()" not in src, "readlines() builds the whole list; iterate the file object instead"
assert "for line in" in src, "iterate the file object itself: for line in f:"
