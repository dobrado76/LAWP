import main

assert main.record(0) == 1
assert main.record(4) == 5
assert main.seen == 2, "rebind seen at each call site"
