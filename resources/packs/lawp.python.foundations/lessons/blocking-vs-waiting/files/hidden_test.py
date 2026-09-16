import main

assert main.blocking_plan([1, 2, 3]) == 6
assert main.blocking_plan([]) == 0
assert main.overlapped_plan([1, 2, 3]) == 3, "overlapped waiting ends with the slowest wait"
assert main.overlapped_plan([4]) == 4
assert main.overlapped_plan([]) == 0, "nothing to wait for is no waiting at all"
