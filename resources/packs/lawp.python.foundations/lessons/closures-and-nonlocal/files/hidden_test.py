import main

add = main.tally()
assert add(4) == 4
assert add(5) == 9
assert add(1) == 10
other = main.tally()
assert other(1) == 1, "each tally needs its own total"
