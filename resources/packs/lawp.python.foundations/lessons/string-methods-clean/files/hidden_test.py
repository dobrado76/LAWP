import main

assert main.clean_zone("  North Ridge  ") == "north-ridge"
assert main.clean_zone("EAST") == "east"
assert main.clean_zone("south  bank") == "south--bank"
assert main.clean_zone("") == ""
assert main.is_error("  err: cold  ") is True
assert main.is_error("ERR: cold") is True
assert main.is_error("ok: warm") is False
