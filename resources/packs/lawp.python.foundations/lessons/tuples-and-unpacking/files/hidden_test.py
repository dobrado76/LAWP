import main

assert main.move((3, 2), 1, -1) == (4, 1)
assert main.move((0, 0), 0, 0) == (0, 0)
assert main.move((5, 5), -5, 2) == (0, 7)
assert isinstance(main.move((1, 1), 2, 2), tuple), "return a tuple, not a list"

start = (5, 5)
main.move(start, 1, 1)
assert start == (5, 5)
