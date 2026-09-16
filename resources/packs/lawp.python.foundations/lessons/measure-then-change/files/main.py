KNOWN = ["fox", "owl", "hare", "badger", "stoat", "heron"]
SIGHTINGS = ["fox", "dragon", "owl", "fox", "griffin", "hare"]


def is_known(name):
    for known in KNOWN:
        if known == name:
            return True
    return False


def count_known(rows):
    return sum(1 for row in rows if is_known(row))


print(count_known(SIGHTINGS))
