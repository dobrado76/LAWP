import main

import inspect

params = inspect.signature(main.report).parameters
assert list(params) == ["read_lines", "clock"], "report(read_lines, clock) - those two names, in that order"
assert params["read_lines"].default is main.read_station_log, "the real reader belongs in the default, not the body"
assert params["clock"].default is main.real_clock, "the real clock belongs in the default, not the body"

calls = []


def fake_read():
    calls.append(1)
    return ["fox 1", "owl 2", "fox 3", "hare 4"]


assert main.report(fake_read, lambda: 900) == "900 fox=2"
assert len(calls) == 1, "call read_lines() exactly once and reuse the lines"
assert main.report(lambda: [], lambda: 0) == "0 fox=0", "no lines means fox=0"
assert main.report(lambda: ["fox"], lambda: 42) == "42 fox=1"

lines = main.read_station_log()
assert isinstance(lines, list) and len(lines) >= 3, "leave the real reader working for production"
