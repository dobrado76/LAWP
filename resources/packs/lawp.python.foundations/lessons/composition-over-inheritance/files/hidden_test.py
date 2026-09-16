import main

fresh = main.Station()
assert not isinstance(fresh, main.Log), "a station is not a kind of log"
assert isinstance(fresh.log, main.Log), "hold the log in self.log"
assert fresh.record("wind 18") == 1
assert fresh.record("soil 11") == 2
assert fresh.log.lines == ["wind 18", "soil 11"]
assert main.Station().log.lines == [], "each station needs its own log"
