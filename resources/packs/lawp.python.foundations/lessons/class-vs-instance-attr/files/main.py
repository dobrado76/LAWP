class Sensor:
    UNIT = "kph"
    seen = []

    def __init__(self, name):
        self.name = name


a = Sensor("wind")
b = Sensor("soil")
a.seen.append(18)

print(len(b.seen))
