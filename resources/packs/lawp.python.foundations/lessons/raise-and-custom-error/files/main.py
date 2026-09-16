class StationError(Exception):
    """Something the field station refuses to do."""


def set_zone(name):
    return name


try:
    set_zone("attic")
except StationError as err:
    print(err)
