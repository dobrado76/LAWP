import main

assert main.average.__annotations__["values"] == list[int], "annotate values as list[int]"
assert main.average.__annotations__["return"] is float, "annotate the result as float"
assert main.label.__annotations__["name"] == (str | None), "annotate name as str | None"
assert main.label.__annotations__["return"] is str

assert main.label(None) == "unnamed"
assert main.label("north") == "north"
assert main.label(7) == 7, "nothing checks the hint at runtime"
assert main.average([2, 4]) == 3.0
