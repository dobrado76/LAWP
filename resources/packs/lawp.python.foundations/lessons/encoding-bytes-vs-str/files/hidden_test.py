import main

assert main.byte_length("fox") == 3
assert main.byte_length("") == 0
assert main.byte_length("caf\u00e9") == 5
assert main.byte_length("na\u00efve") == 6
assert main.roundtrip("caf\u00e9") == "caf\u00e9"
assert main.roundtrip("fox") == "fox"
assert isinstance(main.roundtrip("fox"), str)
