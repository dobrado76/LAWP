import main

assert main.kind_of(3) == "int"
assert main.kind_of("3") == "str"
assert main.kind_of(3.5) == "float"
assert main.kind_of(True) == "bool"
