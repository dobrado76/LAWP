import main

from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "__name__" in src, "guard the script part with if __name__ == ...:"
assert "__main__" in src, "compare __name__ against the string __main__"
assert main.report() == "Ridge ok", "report() should return 'Ridge ok'"
