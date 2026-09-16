import main

assert main.line("fox seen", stamp="1215") == "1215 info fox seen"
assert main.line("gate open") == "0900 info gate open"
assert main.line("power low", level="warn") == "0900 warn power low"
assert main.line("storm", level="warn", stamp="2130") == "2130 warn storm"
