class Sensor:
    def __init__(self, name, value):
        self.name = name
        self.value = value


class Station:
    def __init__(self, name):
        self.name = name

    def add(self, sensor):
        return sensor

    def summary(self):
        return self.name + ": "


station = Station("Ridge")
station.add(Sensor("soil", 11))
station.add(Sensor("wind", 18))

print(station.summary())
