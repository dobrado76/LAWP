import main

assert main.by_length(["fox-den", "owl", "north-gate", "ax"]) == ["ax", "owl", "fox-den", "north-gate"]
assert main.by_length(["bbb", "a", "cc"]) == ["a", "cc", "bbb"]
assert main.by_length(["dd", "cc"]) == ["cc", "dd"]
assert main.by_length([]) == []
