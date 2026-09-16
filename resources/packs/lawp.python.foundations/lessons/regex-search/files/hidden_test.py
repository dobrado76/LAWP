import main

assert main.level("2041-03-02 ERR north sensor cold") == "ERR"
assert main.level("2041-03-02 WARN east damp") == "WARN"
assert main.level("2041-03-02 INFO west dry") == "INFO"
assert main.level("2041-03-02 fox seen") == "UNKNOWN"
assert main.stamp("2041-03-02 ERR north") == "2041-03-02"
assert main.stamp("1999-12-31 INFO west") == "1999-12-31"
assert main.stamp("no date here") is None
