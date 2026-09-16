import os
import sys
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "sys.argv[1]" in src, "the first real argument is sys.argv[1]"
assert "sys.argv[0]" not in src, "sys.argv[0] is the script name, not an argument"
assert "environ.get" in src, "os.environ.get lets you name a default instead of raising"
assert sys.argv[1:] == ["ridge", "3"], "this lesson passes ridge and 3 on the command line"
assert os.environ.get("FOX_NAME") is None, "FOX_NAME is unset on purpose, so the default has to work"
