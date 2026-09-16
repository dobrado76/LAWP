import main

assert main.ticks_to_empty(10, 3) == 4
assert main.ticks_to_empty(9, 3) == 3
assert main.ticks_to_empty(7, 7) == 1
assert main.ticks_to_empty(0, 3) == 0
assert main.ticks_to_empty(10, 0) == -1
assert main.ticks_to_empty(10, -2) == -1
