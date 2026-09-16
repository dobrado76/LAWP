import main

assert main.row("north", 12.3456) == "north     12.35"
assert main.row("e", 1.0) == "e          1.00"
assert len(main.row("north", 12.3456)) == 15
assert main.tag("north") == "'north'"
assert main.tag(12) == "12"
