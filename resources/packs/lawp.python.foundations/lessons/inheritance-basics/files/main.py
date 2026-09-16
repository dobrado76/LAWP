class Sensor:
    def label(self):
        return "sensor"

    def describe(self):
        return self.label() + " on the ridge"


class SoilSensor:
    def label(self):
        return "soil sensor"

    def describe(self):
        return self.label() + " on the ridge"


probe = SoilSensor()

print(probe.describe())
