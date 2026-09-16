import main

assert main.clean_line("  2041-03-02   err   North Sensor COLD  ") == "2041-03-02 ERR north sensor cold"
assert main.clean_line("2041-03-02 warn East Damp") == "2041-03-02 WARN east damp"
assert main.clean_line("   ") is None
assert main.clean_line("") is None
assert main.clean_line("# note") is None
assert main.clean_line("  # indented note") is None
assert main.clean_line("short line") is None

assert main.clean_log(["", "# x", " 2041-03-02 info West Dry "]) == ["2041-03-02 INFO west dry"]
assert main.clean_log([]) == []
assert main.clean_log(main.RAW) == [
    "2041-03-02 ERR north sensor cold",
    "2041-03-02 WARN east damp",
]
