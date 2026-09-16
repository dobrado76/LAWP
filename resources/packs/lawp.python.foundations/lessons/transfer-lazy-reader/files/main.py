from contextlib import contextmanager


@contextmanager
def opened(path):
    handle = open(path, encoding="utf-8")
    yield handle
    handle.close()


def records(lines):
    return []


def temps(rows):
    return []


with opened("station.log") as handle:
    print(sum(temps(records(handle))))
