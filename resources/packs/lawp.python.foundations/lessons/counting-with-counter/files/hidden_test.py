import main

rows = ["fox", "owl", "fox", "fox", "owl", "badger"]
assert main.top_species(rows, 2) == [("fox", 3), ("owl", 2)]
assert main.top_species(rows, 1) == [("fox", 3)]
assert main.top_species([], 3) == []
assert main.top_species(["solo"], 2) == [("solo", 1)]
