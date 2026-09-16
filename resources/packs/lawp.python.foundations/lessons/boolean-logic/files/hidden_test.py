import main

assert main.name_or_default("") == "unnamed"
assert main.name_or_default("fox-den") == "fox-den"
assert main.name_or_default(None) == "unnamed"
assert main.can_send(True, True) is True
assert main.can_send(True, False) is False
assert main.can_send(False, True) is False
