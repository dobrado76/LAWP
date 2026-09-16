import main

assert main.label(None) == "missing"
assert main.label(0) == "empty"
assert main.label("") == "empty"
assert main.label([]) == "empty"
assert main.label("fox") == "ok"
assert main.label(3) == "ok"
