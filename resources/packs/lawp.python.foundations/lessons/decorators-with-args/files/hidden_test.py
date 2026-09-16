import main

assert main.report(0) == "[north] 0 tracks"
assert main.report.__name__ == "report", "keep the wrapped name with functools.wraps"

decorate = main.tagged("dawn")
assert callable(decorate), "tagged(tag) must return a decorator"


@decorate
def note():
    return "clear"


assert note() == "[dawn] clear", "each tag lives in its own closure"
