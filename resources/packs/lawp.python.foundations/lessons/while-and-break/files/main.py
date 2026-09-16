def ticks_to_empty(charge, drain):
    ticks = 0
    while charge > 0:
        ticks = ticks + 1
        if ticks > 100:
            break
    return ticks


print(ticks_to_empty(10, 3))
