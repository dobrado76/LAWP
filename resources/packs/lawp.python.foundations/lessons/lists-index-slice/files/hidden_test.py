import main

assert main.middle_three([12, 7, 19, 3, 22]) == [7, 19, 3]
assert main.middle_three([1, 2, 3, 4, 5, 6]) == [2, 3, 4]
assert main.last([12, 7, 19, 3, 22]) == 22
assert main.last([5]) == 5

shelf = [1, 2, 3, 4, 5]
taken = main.middle_three(shelf)
assert taken is not shelf, "a slice should hand back a new list"
taken.append(99)
assert shelf == [1, 2, 3, 4, 5], "editing the slice must not touch the original"
