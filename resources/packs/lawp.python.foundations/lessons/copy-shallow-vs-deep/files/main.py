import copy


def deep_twin(data):
    return copy.copy(data)


base = {"grid": [[0]], "name": "north"}
twin = deep_twin(base)
twin["grid"][0].append(1)
print(base["grid"], twin["grid"])
