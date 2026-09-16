from contextlib import contextmanager

EVENTS = []


class Station:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


@contextmanager
def shift(name):
    EVENTS.append("start")
    yield name
    EVENTS.append("stop")


try:
    with Station("north") as post, shift("dawn"):
        raise ValueError("storm")
except ValueError:
    pass

print(EVENTS)
