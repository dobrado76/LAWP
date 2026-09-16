from functools import wraps


def tagged(tag):
    def decorate(func):
        return func

    return decorate


@tagged("north")
def report(count):
    return f"{count} tracks"


print(report(2))
