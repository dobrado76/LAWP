import main

assert type(main.first).__name__ == "Sensor"
assert type(main.second).__name__ == "Sensor"
assert main.first is not main.second, "first and second should be two separate instances"
