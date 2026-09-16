import main

assert main.collect("moss") == ["moss"]
assert main.collect("bark") == ["bark"]
assert main.collect("fern", ["moss"]) == ["moss", "fern"]
first = main.collect("a")
second = main.collect("b")
assert first is not second, "each defaulted call needs its own list"
