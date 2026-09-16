import main

import dataclasses

r = main.Reading("soil", 11)
assert dataclasses.is_dataclass(r), "Reading should be a dataclass"
assert r == main.Reading("soil", 11), "a dataclass compares field by field"
assert repr(r) == "Reading(name='soil', value=11)"
assert hash(r) == hash(main.Reading("soil", 11)), "frozen records are hashable"
try:
    r.value = 12
except dataclasses.FrozenInstanceError:
    pass
else:
    raise AssertionError("frozen=True should refuse the assignment")
