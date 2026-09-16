import main

assert main.numbered(["north", "east"]) == ["1: north", "2: east"]
assert main.numbered([]) == []
assert main.numbered(["solo"]) == ["1: solo"]
assert main.pair_up(["north", "east", "south"], [12, 7]) == [("north", 12), ("east", 7)]
assert main.pair_up([], [1, 2]) == []
assert main.pair_up(["a", "b"], [1, 2]) == [("a", 1), ("b", 2)]
