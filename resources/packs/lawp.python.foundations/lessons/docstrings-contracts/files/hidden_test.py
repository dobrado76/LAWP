import main

import doctest

assert main.grid_step((0, 0), "east") == (1, 0)
assert main.grid_step((2, 3), "west") == (1, 3)
assert main.grid_step((2, 3), "north") == (2, 2), "north decreases y"
assert main.grid_step((2, 3), "south") == (2, 4), "south increases y"

start = (1, 1)
assert main.grid_step(start, "east") == (2, 1)
assert start == (1, 1), "hand back a new tuple; do not touch pos"

try:
    main.grid_step((0, 0), "up")
except ValueError as err:
    assert "up" in str(err), "name the bad direction in the message"
else:
    raise AssertionError("an unknown direction has to raise ValueError")

doc = main.grid_step.__doc__ or ""
for needed in ("Args:", "Returns:", "Raises:", ">>>", "ValueError"):
    assert needed in doc, "the docstring is missing " + needed
assert len(doc.split()) >= 25, "state the whole contract, not a restatement of the name"

result = doctest.testmod(main, verbose=False)
assert result.attempted >= 1, "add at least one >>> example to the docstring"
assert result.failed == 0, "a >>> example does not match what the function returns"
