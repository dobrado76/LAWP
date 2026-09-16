WAITS = [3, 5, 2]


def blocking_plan(waits):
    return sum(waits)


def overlapped_plan(waits):
    return sum(waits)


print(blocking_plan(WAITS), overlapped_plan(WAITS))
