def count_sightings(rows, animal):
    for row in rows:
        if row["animal"] == animal:
            print(row)


def test_count_sightings():
    count_sightings([{"animal": "fox", "x": 1, "y": 1}], "fox")


test_count_sightings()
print("ok")
