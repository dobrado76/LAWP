total = 0
note = ""
most = -1

with open("stations.csv", encoding="utf-8") as f:
    rows = f.read().splitlines()[1:]

for row in rows:
    parts = row.split(",")
    drift = int(parts[-1])
    total += drift
    if drift > most:
        most = drift
        note = parts[1]

print(total, note)
