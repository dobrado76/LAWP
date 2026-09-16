def tally():
    total = 0

    def add(n):
        return total + n

    return add


add = tally()
add(4)
print(add(5))
