from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "json.dumps" in src, "write the record out as JSON text with json.dumps"
assert "json.loads" in src, "read that text back with json.loads"

import main

assert isinstance(main.back, dict), "back should be the dict json.loads built"
assert main.back["grid"] == [3, 2], "a tuple comes back as a list"
assert "7" in main.back, 'an integer key comes back as the string key "7"'
assert 7 not in main.back, "the integer key itself does not survive"
