import main

creek = main.Station("Creek")
assert creek.summary() == "Creek: no sensors", "say so when nothing has been added"
creek.add(main.Sensor("temp", 4))
assert creek.summary() == "Creek: temp=4"
creek.add(main.Sensor("wind", 22))
assert creek.summary() == "Creek: temp=4, wind=22", "keep the order the sensors were added in"
assert not isinstance(creek, main.Sensor), "a station holds sensors; it is not one"
assert main.Station("Ridge").summary() == "Ridge: no sensors", "each station needs its own sensor list"
