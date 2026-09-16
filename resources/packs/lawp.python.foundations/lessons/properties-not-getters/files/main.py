class Sensor:
    def __init__(self, celsius):
        self.celsius = celsius

    def get_fahrenheit(self):
        return round(self.celsius * 9 / 5 + 32, 1)


probe = Sensor(20)

print(probe.get_fahrenheit())
