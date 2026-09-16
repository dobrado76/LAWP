from itertools import chain, count, groupby, islice
from operator import itemgetter

ROWS = [("temp", 3), ("wind", 9), ("temp", 5), ("wind", 1), ("temp", 4)]


def labels(n):
    return []


def merged(a, b):
    return a


def by_kind(rows):
    return {}


print(by_kind(ROWS))
