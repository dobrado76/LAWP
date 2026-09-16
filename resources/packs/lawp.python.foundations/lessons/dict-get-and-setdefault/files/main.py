def reading_for(counts, name):
    if name in counts:
        return counts[name]
    return None


def group_by_zone(records):
    groups = {}
    for name, zone in records:
        groups[zone] = [name]
    return groups


print(reading_for({"fox": 3}, "owl"))
