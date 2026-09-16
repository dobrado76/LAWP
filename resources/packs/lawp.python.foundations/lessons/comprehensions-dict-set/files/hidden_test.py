import main

assert main.invert({"north": 12, "east": 7}) == {12: "north", 7: "east"}
assert main.invert({}) == {}
assert main.zones_over({"north": 12, "east": 7, "south": 19}, 10) == {"north": 12, "south": 19}
assert main.zones_over({"east": 7}, 10) == {}
assert main.zones_over({}, 0) == {}
