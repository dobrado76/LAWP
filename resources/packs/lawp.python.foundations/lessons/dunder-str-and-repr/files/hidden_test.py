import main

gust = main.Sensor("wind")
assert str(gust) == "wind sensor", "__str__ should read like a sentence"
assert repr(gust) == "Sensor('wind')", "__repr__ should look like the call that built it"
assert repr([gust]) == "[Sensor('wind')]"
