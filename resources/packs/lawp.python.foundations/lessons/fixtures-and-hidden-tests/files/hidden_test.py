import main

assert isinstance(main.FIXTURE, list), "FIXTURE must be a list"
assert len(main.FIXTURE) >= 3, "FIXTURE needs at least three rows"
for row in main.FIXTURE:
    assert set(row) >= {"animal", "x", "y"}, "every fixture row needs animal, x and y"

assert main.busiest_cell(main.FIXTURE) == (2, 1), "the fixture should make (2, 1) the busiest cell"
assert main.busiest_cell([{"animal": "owl", "x": 0, "y": 0}]) == (0, 0), "one row means one busiest cell"
assert main.busiest_cell(
    [
        {"animal": "fox", "x": 1, "y": 1},
        {"animal": "owl", "x": 0, "y": 5},
        {"animal": "owl", "x": 0, "y": 5},
    ]
) == (0, 5), "the repeated cell wins"
assert main.busiest_cell(
    [{"animal": "fox", "x": 3, "y": 0}, {"animal": "owl", "x": 1, "y": 2}]
) == (1, 2), "a tie returns the smallest tuple"
assert main.busiest_cell([]) is None, "an empty log has no busiest cell"
