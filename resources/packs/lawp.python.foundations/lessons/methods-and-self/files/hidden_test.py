import main

assert main.Sensor("wind").label() == "sensor:wind"
assert main.Sensor("temp").label() == "sensor:temp"
assert main.Sensor.label(main.Sensor("soil")) == "sensor:soil"
