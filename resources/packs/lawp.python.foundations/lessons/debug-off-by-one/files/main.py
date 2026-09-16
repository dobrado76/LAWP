READINGS = "37152"


def highest(digits):
    best = 0
    for i in range(len(digits) + 1):
        value = int(digits[i])
        if value > best:
            best = value
    return best


print(highest(READINGS))
