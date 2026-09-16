class Sensor:
    def __init__(self, name):
        self.name = name
        self.ready = True


class SoilSensor(Sensor):
    def __init__(self, name, percent):
        self.name = name
        self.percent = percent


probe = SoilSensor("soil", 11)

print(probe.name, probe.percent)
