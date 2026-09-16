class Sensor:
    def __init__(self, name):
        self.name = name

    def label(self):
        return "sensor:soil"


probe = Sensor("soil")

print(probe.label())
