def averages(gradebook):
    return {}


def best(gradebook):
    return gradebook[0]["name"]


print(best([
    {"name": "fox", "scores": [6, 7]},
    {"name": "owl", "scores": [8, 9]},
]))
