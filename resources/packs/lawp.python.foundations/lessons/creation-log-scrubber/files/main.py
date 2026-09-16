with open("station.log", encoding="utf-8") as f:
    lines = f.read().splitlines()

with open("report.txt", "w", encoding="utf-8") as out:
    for row in lines:
        out.write(row + "\n")

print(len(lines))
