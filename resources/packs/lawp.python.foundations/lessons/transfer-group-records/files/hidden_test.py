import main

rows = main.ROWS
assert main.names_by(rows, "zone") == {"north": ["fox", "stoat"], "south": ["owl"]}
assert main.names_by(rows, "shift") == {"am": ["fox"], "pm": ["owl", "stoat"]}
assert main.group_by(rows, "zone")["south"] == [rows[1]]
assert len(main.group_by(rows, "zone")["north"]) == 2
assert main.names_by([], "zone") == {}
assert main.group_by([], "zone") == {}
