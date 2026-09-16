import main

s = main.Sensor(100)
assert isinstance(type(s).__dict__.get("fahrenheit"), property), "fahrenheit should be a property"
assert s.fahrenheit == 212.0
s.celsius = 0
assert s.fahrenheit == 32.0, "a derived property should follow the attribute it is built from"
