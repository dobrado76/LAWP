import main

from pathlib import Path

records, rejects = main.load_records("station.log")
assert [row["animal"] for row in records] == ["fox", "owl", "fox", "hare", "fox", "owl"], records
assert records[0] == {"animal": "fox", "x": 2, "y": 1}, records[0]
assert all(isinstance(row["x"], int) and isinstance(row["y"], int) for row in records), "x and y are ints"
assert rejects == ["badger,oops,2"], rejects

Path("hidden_case.log").write_text("# day 1\nfox,1,1\n\nowl,1,1\nfox,0,0\nbroken\n", encoding="utf-8")
small, bad = main.load_records("hidden_case.log")
assert len(small) == 3, small
assert bad == ["broken"], bad

summary = main.summarise(small)
assert summary["rows"] == 3, summary
assert summary["animals"] == 2, summary
assert summary["busiest"] == "fox", summary
assert summary["top_cell"] == (1, 1), summary
assert main.format_report(summary) == "rows=3 animals=2 busiest=fox top-cell=1,1"

empty = main.summarise([])
assert empty == {"rows": 0, "animals": 0, "busiest": None, "top_cell": None}, empty
assert main.format_report(empty) == "rows=0 animals=0 busiest=none top-cell=none"

tie = main.summarise([{"animal": "owl", "x": 3, "y": 0}, {"animal": "fox", "x": 1, "y": 2}])
assert tie["busiest"] == "fox", "a tie on count breaks alphabetically"
assert tie["top_cell"] == (1, 2), "a tie on cells breaks to the smallest tuple"

tests = [name for name in dir(main) if name.startswith("test_") and callable(getattr(main, name))]
assert len(tests) >= 3, "the capstone ships at least three tests"
for name in tests:
    getattr(main, name)()

src = Path("main.py").read_text(encoding="utf-8")
assert src.count("assert ") >= 4, "tests need assertions, not just calls"
