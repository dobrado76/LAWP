class Sensor:
    def __init__(self):
        self.name = "soil"
        self.reading = 11


probe = Sensor()

print(probe.name, probe.reading)
