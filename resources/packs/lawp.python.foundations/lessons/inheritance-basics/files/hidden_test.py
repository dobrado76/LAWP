import main

probe = main.SoilSensor()
assert isinstance(probe, main.Sensor), "SoilSensor should subclass Sensor"
assert probe.describe() == "soil sensor on the ridge"
assert "describe" not in main.SoilSensor.__dict__, "inherit describe instead of copying it"
assert main.Sensor().describe() == "sensor on the ridge", "leave the base class working"
