import main

assert main.total_sightings({"fox": 3, "owl": 1, "badger": 5}) == 9
assert main.total_sightings({}) == 0
assert main.total_sightings({"fox": 2}) == 2
assert main.names_seen({"owl": 1, "fox": 3}) == ["fox", "owl"]
assert main.names_seen({}) == []
