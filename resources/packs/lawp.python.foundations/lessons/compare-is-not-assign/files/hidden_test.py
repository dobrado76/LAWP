import main

assert main.at_limit(5) is True
assert main.at_limit(4) is False
assert main.at_limit(6) is False
assert main.at_limit(0) is False
