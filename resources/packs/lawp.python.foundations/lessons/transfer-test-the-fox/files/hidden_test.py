import main

from pathlib import Path

NAMES = (
    "test_walks_east",
    "test_stays_on_the_grid",
    "test_ignores_unknown_move",
    "test_returns_a_new_tuple",
)

src = Path("main.py").read_text(encoding="utf-8")
assert "from walk import walk" in src, "import it with: from walk import walk"

for name in NAMES:
    assert callable(getattr(main, name, None)), "expected a function called " + name
    getattr(main, name)()


def broken(moves, start=(0, 0), size=5):
    """A walk that never moves. A real suite must notice."""
    return start


main.walk = broken
caught = 0
for name in NAMES:
    try:
        getattr(main, name)()
    except AssertionError:
        caught += 1
assert caught >= 3, "a walk that never moves should fail at least three of your tests"
