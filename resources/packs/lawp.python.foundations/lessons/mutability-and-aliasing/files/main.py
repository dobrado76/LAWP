def add_reading(log, value):
    log = log + [value]


def with_reading(log, value):
    log.append(value)
    return log


base = [4]
add_reading(base, 5)
fresh = with_reading(base, 6)
print(base, fresh)
