import main

shared = [1, 2]
assert main.report(shared, shared) == "same"
assert main.report([1, 2], [1, 2]) == "equal"
assert main.report([1, 2], [3]) == "different"
assert main.report(None, None) == "same"
assert main.report("north", 4) == "different"
