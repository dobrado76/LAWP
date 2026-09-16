import main

a = main.Tag("soil")
b = main.Tag("soil")
assert a == b, "tags with the same name should be equal"
assert hash(a) == hash(b), "equal tags must hash the same"
assert len({a, b}) == 1
assert a != main.Tag("wind")
assert {a: 1}[b] == 1, "an equal tag should find the same dict entry"
