class Sensor:
    def __init__(self, name):
        self.name = name


probe = Sensor("soil")

print(f"{probe} | {probe!r}")
