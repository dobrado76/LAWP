from collections import Counter


def top_species(names, n):
    return sorted(set(names))[:n]


print(top_species(["fox", "owl", "fox", "fox", "owl", "badger"], 2))
