import main

assert main.reading("temp", 21) == "temp 21C"
assert main.reading("depth", 0) == "depth 0C"
assert main.reading("wind", 4, "kn") == "wind 4kn"
