def as_number(value):
    if isinstance(value, str) and value.isdigit():
        return float(value)
    return None


def first_reading(rows, zone):
    if zone in rows and len(rows[zone]) > 0:
        return rows[zone][0]
    return None


print(as_number("12.5"), first_reading({"north": []}, "north"))
