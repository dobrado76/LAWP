import main

assert main.station_code("NR-2041-fox") == "NR"
assert main.station_code("SW-1999-owl") == "SW"
assert main.year("NR-2041-fox") == "2041"
assert main.year("SW-1999-owl") == "1999"
assert main.reversed_tag("fox") == "xof"
assert main.reversed_tag("") == ""
assert main.reversed_tag("ab") == "ba"
