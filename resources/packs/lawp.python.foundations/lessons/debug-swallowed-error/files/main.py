ROWS = [
    {"zone": "north", "reading": "12"},
    {"zone": "east", "reading": "7"},
    {"zone": "south", "reading": "warm"},
]


def total_readings(rows):
    total = 0
    for row in rows:
        try:
            total += int(row["value"])
        except:
            pass
    return total


def skipped(rows):
    return 0


print(total_readings(ROWS))
