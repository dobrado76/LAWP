import main

from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "super(" in src, "call super().__init__(name) from the subclass"
probe = main.SoilSensor("soil", 11)
assert probe.name == "soil" and probe.percent == 11
assert probe.ready is True, "the base __init__ never ran, so ready was never set"
assert main.SoilSensor.__mro__[1] is main.Sensor
