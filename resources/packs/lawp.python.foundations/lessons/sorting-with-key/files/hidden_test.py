import main

rows = [("ridge", 7), ("creek", 19), ("bluff", 12)]
assert main.by_strength(rows) == [("creek", 19), ("bluff", 12), ("ridge", 7)]
assert rows == [("ridge", 7), ("creek", 19), ("bluff", 12)], "sorted() should leave the original alone"
assert main.by_strength([]) == []
assert main.by_strength([("solo", 1)]) == [("solo", 1)]
