from functools import wraps

CALLS = []


def traced(func):
    return func


@traced
def scan(cell):
    return f"scanned {cell}"


print(scan("north"), scan.__name__, len(CALLS))
