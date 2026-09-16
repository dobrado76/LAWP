import main

base = [1, 2]
grown = main.add_reading(base, 3)
assert grown == [1, 2, 3]
assert base == [1, 2], "the list you were given must not change"
assert grown is not base, "return a new list, not the same one"
assert main.add_reading([], 5) == [5]
