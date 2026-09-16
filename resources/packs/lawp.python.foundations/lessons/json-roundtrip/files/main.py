import json

record = {"station": "north", "grid": (3, 2), 7: "fox"}
back = record

print(type(back["grid"]).__name__, "7" in back)
