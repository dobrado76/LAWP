import main

assert main.parse_int_safe(" 12 ") == (12, None)
assert main.parse_int_safe("0") == (0, None)

value, reason = main.parse_int_safe("warm")
assert value is None
assert isinstance(reason, str) and "warm" in reason

for weird in [None, "", "x", 3.7, [1], {}]:
    value, reason = main.parse_int_safe(weird)
    assert (value is None) != (reason is None), "exactly one of value and reason is set"

values, problems = main.parse_all([" 3 ", "warm", "4"])
assert values == [3, 4]
assert len(problems) == 1 and "warm" in problems[0]
assert main.parse_all([]) == ([], [])
