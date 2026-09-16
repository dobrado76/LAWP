import main

assert main.Sensor.UNIT == "kph", "UNIT should stay a shared class attribute"
assert "seen" not in main.Sensor.__dict__, "seen should not live on the class"
x = main.Sensor("temp")
y = main.Sensor("soil")
x.seen.append(4)
assert y.seen == [], "each sensor needs its own seen list"
assert x.seen == [4]
