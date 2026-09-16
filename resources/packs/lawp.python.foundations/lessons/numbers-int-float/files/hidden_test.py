import main

assert main.boxes_and_rest(17, 5) == (3, 2)
assert main.boxes_and_rest(9, 3) == (3, 0)
assert main.boxes_and_rest(4, 10) == (0, 4)
boxes, rest = main.boxes_and_rest(17, 5)
assert isinstance(boxes, int) and isinstance(rest, int), "both parts must be whole numbers"
