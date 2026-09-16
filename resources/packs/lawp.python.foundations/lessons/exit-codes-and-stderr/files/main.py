import sys

total = 0

with open("readings.txt", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line.isdigit():
            print("skipping", line)
            continue
        total += int(line)

print(total)
