import main

gust = main.Sensor("wind", 18)
assert gust.name == "wind"
assert gust.reading == 18
soil = main.Sensor("soil", 11)
assert soil.name == "soil" and soil.reading == 11
assert gust.name == "wind", "each instance keeps its own attributes"
