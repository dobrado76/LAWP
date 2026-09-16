import main

main.EVENTS.clear()
with main.Station("north") as post:
    assert post.name == "north", "__enter__ should hand back the station"
assert main.EVENTS == ["open", "close"], "record both ends of the managed block"

main.EVENTS.clear()
try:
    with main.shift("dawn"):
        raise KeyError("missing")
except KeyError:
    pass
else:
    raise AssertionError("__exit__ must not swallow the error")
assert main.EVENTS == ["start", "stop"], "the finally block has to run on the way out"
