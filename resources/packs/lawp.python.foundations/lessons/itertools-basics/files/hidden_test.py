import main

from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
for tool in ("islice", "chain", "groupby"):
    assert tool in src, "expected your code to use " + tool

assert main.labels(3) == ["S0", "S1", "S2"]
assert main.labels(0) == []
assert list(main.merged([1, 2], [3])) == [1, 2, 3]
assert not isinstance(main.merged([1], [2]), list), "chain should stay lazy"
assert main.by_kind([("b", 1), ("a", 2), ("b", 3)]) == {"a": [2], "b": [1, 3]}
assert main.by_kind([]) == {}
