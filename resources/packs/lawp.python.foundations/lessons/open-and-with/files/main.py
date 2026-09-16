f = open("station.log", encoding="utf-8")
lines = f.read().splitlines()

out = open("count.txt", "w", encoding="utf-8")
out.write(str(len(lines)))

with open("count.txt", encoding="utf-8") as check:
    print(check.read())
