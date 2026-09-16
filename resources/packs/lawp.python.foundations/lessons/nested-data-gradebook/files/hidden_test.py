import main

rows = [
    {"name": "fox", "zone": "north", "scores": [8, 9]},
    {"name": "owl", "zone": "south", "scores": [6, 7]},
    {"name": "badger", "zone": "north", "scores": [10]},
]
assert main.averages(rows) == {"fox": 8.5, "owl": 6.5, "badger": 10.0}
assert main.best(rows) == "badger"
assert main.averages([]) == {}
assert main.averages([{"name": "solo", "scores": [1, 2]}]) == {"solo": 1.5}
