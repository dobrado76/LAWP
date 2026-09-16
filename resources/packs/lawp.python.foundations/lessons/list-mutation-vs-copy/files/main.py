def add_reading(log, value):
    fresh = log
    fresh.append(value)
    return fresh


base = [12, 7]
print(add_reading(base, 19), base)
