import main

assert main.unique_sorted(["fox", "owl", "fox"]) == ["fox", "owl"]
assert main.unique_sorted([]) == []
assert main.unique_sorted(["owl"]) == ["owl"]
assert main.both_shifts(["fox", "owl"], ["owl", "badger"]) == ["owl"]
assert main.both_shifts(["fox"], ["owl"]) == []
assert main.both_shifts(["fox", "fox", "owl"], ["fox", "owl"]) == ["fox", "owl"]
