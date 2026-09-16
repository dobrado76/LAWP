def first_odd_multiple(limit):
    found = 0
    for n in range(1, limit):
        if n % 2 == 0:
            found = 0
        if n % 7 == 0:
            found = n
    return found


print(first_odd_multiple(30))
