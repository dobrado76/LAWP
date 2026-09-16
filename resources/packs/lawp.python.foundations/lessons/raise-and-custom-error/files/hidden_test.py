import main

assert issubclass(main.StationError, Exception)
assert main.set_zone("north") == "north"
assert main.set_zone("west") == "west"

try:
    main.set_zone("attic")
except main.StationError as err:
    assert "attic" in str(err), "put the rejected name in the message"
else:
    raise AssertionError("set_zone should raise StationError for an unknown zone")
