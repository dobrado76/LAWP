import main

assert main.total(3, 4, 5) == 12
assert main.total() == 0
assert main.total(*[1, 2]) == 3
assert main.total(1, 2, scale=3) == 9
