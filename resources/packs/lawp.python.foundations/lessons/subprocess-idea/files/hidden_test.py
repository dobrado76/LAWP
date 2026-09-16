from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "shell=True" not in src, "the list form is the safe one; do not reach for the shell"

import main

cmd = main.build_command("ridge", "fox drift; then quiet")
assert isinstance(cmd, list), "an argument list is a list of separate items, not one string"
assert cmd[0] == "python", "the program to start comes first"
assert cmd[1] == "report.py", "the script is an argument to that program"
assert cmd[2:4] == ["--station", "ridge"], "a flag and its value are two items"
assert cmd[4] == "--note", "then the note flag"
assert cmd[5] == "fox drift; then quiet", "the note stays one item, spaces and semicolon included"
assert len(cmd) == 6, "six items in all"
