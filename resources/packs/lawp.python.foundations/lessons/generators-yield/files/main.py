def station_ids(count):
    ids = []
    for number in range(1, count + 1):
        ids.append(f"S{number}")
    return ids


print(list(station_ids(3)))
