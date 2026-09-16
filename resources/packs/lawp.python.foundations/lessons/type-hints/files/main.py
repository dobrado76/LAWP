def average(values):
    return sum(values) / len(values)


def label(name):
    return name


print(average([1, 2, 3]), label(None), average.__annotations__.get("values", "missing"))
