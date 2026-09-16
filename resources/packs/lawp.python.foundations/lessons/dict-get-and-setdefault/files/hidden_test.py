import main

assert main.reading_for({"fox": 3}, "fox") == 3
assert main.reading_for({"fox": 3}, "owl") == 0
assert main.reading_for({}, "anything") == 0

rows = [("fox", "north"), ("owl", "north"), ("badger", "south")]
assert main.group_by_zone(rows) == {"north": ["fox", "owl"], "south": ["badger"]}
assert main.group_by_zone([]) == {}
