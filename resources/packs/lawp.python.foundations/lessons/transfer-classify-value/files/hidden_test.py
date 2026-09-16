import main

assert main.classify(None) == "missing"
assert main.classify(True) == "flag"
assert main.classify(False) == "flag"
assert main.classify(3) == "count"
assert main.classify(0) == "count"
assert main.classify(1.5) == "measure"
assert main.classify(0.0) == "measure"
assert main.classify("") == "blank"
assert main.classify("fox-den") == "text"
