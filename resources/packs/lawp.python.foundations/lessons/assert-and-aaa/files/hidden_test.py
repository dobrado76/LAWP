import main

from pathlib import Path

LOG = [
    {"animal": "fox", "x": 2, "y": 1},
    {"animal": "owl", "x": 0, "y": 3},
    {"animal": "fox", "x": 4, "y": 4},
]

assert main.count_sightings(LOG, "fox") == 2, "two fox rows in that log"
assert main.count_sightings(LOG, "owl") == 1, "one owl row in that log"
assert main.count_sightings(LOG, "hare") == 0, "no hare rows, so zero"
assert main.count_sightings([], "fox") == 0, "an empty log counts zero"
assert LOG[0] == {"animal": "fox", "x": 2, "y": 1}, "counting must not edit the rows"

src = Path("main.py").read_text(encoding="utf-8")
assert "def test_count_sightings" in src, "write a test_count_sightings() function"
assert "assert" in src, "the test needs an assert, not just a call"
assert main.test_count_sightings() is None, "a passing test returns nothing"
