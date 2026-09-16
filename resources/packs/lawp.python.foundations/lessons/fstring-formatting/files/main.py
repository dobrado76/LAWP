def row(zone, reading):
    return zone + " " + str(reading)


def tag(value):
    return str(value)


print(f"[{row('north', 12.3456)}]")
