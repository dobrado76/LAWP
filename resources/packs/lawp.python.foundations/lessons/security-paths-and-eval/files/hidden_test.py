import main

import re
from pathlib import Path

assert main.read_note("fox.txt").strip() == "fox at 2,1", "a name inside the root still reads"

for bad in ("../secret.txt", "../../secret.txt", "sub/../../secret.txt"):
    try:
        main.read_note(bad)
    except ValueError:
        pass
    else:
        raise AssertionError("read_note must refuse " + bad)

try:
    main.read_note("missing.txt")
except FileNotFoundError:
    pass
else:
    raise AssertionError("a missing name inside the root is FileNotFoundError, not a refusal")

assert main.safe_number("41") == 41
assert main.safe_number(" -7 ") == -7
assert main.safe_number("2 + 2") is None, "an expression is not a number"
assert main.safe_number("__import__('os').getcwd()") is None, "never evaluate that"

src = Path("main.py").read_text(encoding="utf-8")
assert not re.search(r"(?<![\w.])eval\s*\(", src), "eval is never the answer here"
assert not re.search(r"(?<![\w.])exec\s*\(", src), "exec is never the answer here"
assert "resolve()" in src, "resolve the path before you judge it"
