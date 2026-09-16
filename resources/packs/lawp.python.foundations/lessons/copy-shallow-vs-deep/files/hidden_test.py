import main

record = {"grid": [[1], [2]], "name": "north"}
twin = main.deep_twin(record)
assert twin == record, "the twin should start out equal"
assert twin is not record
assert twin["grid"] is not record["grid"], "the nested list must be a new object"
assert twin["grid"][0] is not record["grid"][0]
twin["grid"][0].append(9)
assert record["grid"][0] == [1], "the original must not change"
