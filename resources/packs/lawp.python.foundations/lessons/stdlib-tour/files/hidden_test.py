import main

assert main.top_tag(["wind", "wind", "soil"]) == "wind=2"
assert main.top_tag(["temp"]) == "temp=1"
assert main.top_tag(["a", "b", "b", "b", "a"]) == "b=3"
