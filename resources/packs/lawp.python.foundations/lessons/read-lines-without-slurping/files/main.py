count = 0

with open("station.log", encoding="utf-8") as f:
    for line in f:
        if line.endswith("drift"):
            count += 1

print(count)
