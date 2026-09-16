import main

import inspect

assert inspect.isgeneratorfunction(main.cleaned), "cleaned should yield, not build a list"
assert inspect.isgeneratorfunction(main.temps), "temps should yield, not build a list"

assert list(main.cleaned(["  a  ", " b "])) == ["a", "b"]
assert list(main.temps(["temp=5", "skip", "temp=7"])) == [5, 7]

stream = main.temps(main.cleaned(main.noisy(4)))
assert next(stream) == 0
assert sum(stream) == 2
