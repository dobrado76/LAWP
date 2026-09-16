import main

assert main.on_grid(0, 0) is True
assert main.on_grid(6, 4) is True
assert main.on_grid(3, 2) is True
assert main.on_grid(7, 4) is False
assert main.on_grid(3, 5) is False
assert main.on_grid(-1, 2) is False
assert main.on_grid(2, -1) is False
