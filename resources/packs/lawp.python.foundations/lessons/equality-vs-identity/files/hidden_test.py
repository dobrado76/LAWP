import main

one = ["fox"]
two = ["fox"]
assert main.same_object(one, two) is False
assert main.same_object(one, one) is True
assert main.same_value(one, two) is True
assert main.same_value(one, ["owl"]) is False
assert main.same_object(None, None) is True
