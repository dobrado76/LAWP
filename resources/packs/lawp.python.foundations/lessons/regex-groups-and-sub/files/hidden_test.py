import main

got = main.parse("2041-03-02 ERR north sensor cold")
assert got == {"stamp": "2041-03-02", "level": "ERR", "zone": "north"}
assert main.parse("1999-12-31 WARN east") == {"stamp": "1999-12-31", "level": "WARN", "zone": "east"}
assert main.parse("nothing useful here") is None
assert main.redact("2041-03-02 ERR north") == "<date> ERR north"
assert main.redact("no date") == "no date"
assert main.redact("2041-03-02 and 1999-12-31") == "<date> and <date>"
