ROWS = [{"x": 0, "y": 0}, {"x": 9, "y": 0}, {"x": 4, "y": 4}]


def check_rows(rows):
    good = 0
    for row in rows:
        if 0 <= row["x"] < 5 and 0 <= row["y"] < 5:
            good += 1
        else:
            print("off grid:", row["x"], row["y"])
    print("checked", len(rows), "rows")
    return good


print(check_rows(ROWS))
