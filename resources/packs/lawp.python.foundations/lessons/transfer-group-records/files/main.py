def group_by(records, field):
    return {}


def names_by(records, field):
    return {}


ROWS = [
    {"name": "fox", "zone": "north", "shift": "am"},
    {"name": "owl", "zone": "south", "shift": "pm"},
    {"name": "stoat", "zone": "north", "shift": "pm"},
]
print(names_by(ROWS, "zone"))
