class Sensor:
    pass


first = Sensor()
second = first

print(type(first).__name__, first is second)
