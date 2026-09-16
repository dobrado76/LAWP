def total_sightings(counts):
    total = 0
    for name in counts:
        total += 1
    return total


def names_seen(counts):
    return []


print(total_sightings({"fox": 3, "owl": 1, "badger": 5}))
