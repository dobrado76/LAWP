def labels(readings):
    return [f"{value} mV" for value in readings]


print(labels([12, 7, 19, 3, 22]))
