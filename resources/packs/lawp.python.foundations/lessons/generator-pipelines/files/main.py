def noisy(count):
    """Pretend this log is far too big to hold in memory."""
    for number in range(count):
        yield f"  temp={number}  " if number % 2 == 0 else "  skip  "


def cleaned(lines):
    return []


def temps(rows):
    return []


print(sum(temps(cleaned(noisy(1000)))))
