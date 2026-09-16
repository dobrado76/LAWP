import main

import inspect
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "finally" in src, "the reader must close the file even when the block raises"
assert inspect.isgeneratorfunction(main.records), "records should yield, not build a list"
assert inspect.isgeneratorfunction(main.temps), "temps should yield, not build a list"

assert list(main.records(["# note", "", "  temp=1  ", "wind=2"])) == ["temp=1", "wind=2"]
assert list(main.temps(["temp=1", "wind=2", "temp=3", "sensor rebooted"])) == [1, 3]

try:
    with main.opened("station.log") as handle:
        raise RuntimeError("storm")
except RuntimeError:
    pass
assert handle.closed, "close has to survive an exception inside the block"
