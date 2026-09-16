import main

assert main.battery_state(95) == "high"
assert main.battery_state(81) == "high"
assert main.battery_state(80) == "steady"
assert main.battery_state(42) == "steady"
assert main.battery_state(21) == "steady"
assert main.battery_state(20) == "low"
assert main.battery_state(0) == "low"
