import main

first = [1]
assert main.add_reading(first, 2) is None, "add_reading should return nothing"
assert first == [1, 2], "add_reading must edit the caller's list"

second = [1]
grown = main.with_reading(second, 2)
assert grown == [1, 2]
assert second == [1], "with_reading must leave the caller's list alone"
assert grown is not second
