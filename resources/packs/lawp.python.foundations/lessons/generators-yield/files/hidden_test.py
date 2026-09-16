import main

import inspect

assert inspect.isgeneratorfunction(main.station_ids), "station_ids should be a generator function"

stream = main.station_ids(3)
assert not isinstance(stream, list), "calling it must not build a list"
assert next(stream) == "S1"
assert list(stream) == ["S2", "S3"]
assert list(stream) == [], "a spent generator yields nothing the second time"
assert list(main.station_ids(0)) == []
