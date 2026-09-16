with open("readings.txt", encoding="utf-8") as f:
    numbers = [int(line) for line in f]

with open("report.txt", "a", encoding="utf-8") as out:
    out.write("total=" + str(sum(numbers)))

with open("report.txt", encoding="utf-8") as f:
    print(f.read())
