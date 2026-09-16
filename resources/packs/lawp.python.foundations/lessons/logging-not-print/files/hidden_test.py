import main

import logging
from pathlib import Path

assert main.check_rows([{"x": 0, "y": 0}]) == 1, "an on-grid row counts"
assert main.check_rows([{"x": 9, "y": 0}]) == 0, "an off-grid row does not"
assert main.check_rows([]) == 0, "no rows, nothing on the grid"

logging.shutdown()
written = Path("run.log").read_text(encoding="utf-8")
assert "WARNING" in written, "an off-grid row deserves a WARNING record"
assert "INFO" in written, "log one INFO summary at the end"
assert "9" in written, "name the offending cell in the warning"

src = Path("main.py").read_text(encoding="utf-8")
assert "logging" in src, "use the logging module, not print, for diagnostics"
assert src.count("print(") == 1, "one print for the answer; every diagnostic goes to the log"
