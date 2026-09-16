import main

route = main.Route(["a", "b"])
assert iter(route) is route, "__iter__ should return the iterator itself"
assert next(route) == "a"
assert next(route) == "b"
try:
    next(route)
except StopIteration:
    pass
else:
    raise AssertionError("expected StopIteration once the route is spent")

assert list(main.Route([])) == []
assert [cell for cell in main.Route([1, 2])] == [1, 2]
