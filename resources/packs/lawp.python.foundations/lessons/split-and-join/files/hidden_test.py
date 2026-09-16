import main

assert main.fields("north , 12 ,ok") == ["north", "12", "ok"]
assert main.fields("solo") == ["solo"]
assert main.fields(" a,b ") == ["a", "b"]
assert main.render(["a", "b"]) == "a | b"
assert main.render(["solo"]) == "solo"
assert main.render([]) == ""
