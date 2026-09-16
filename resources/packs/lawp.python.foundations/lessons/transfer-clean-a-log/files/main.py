import re


def clean_line(line):
    return line


def clean_log(lines):
    return lines


RAW = [
    "  2041-03-02   err   North Sensor COLD  ",
    "# maintenance note",
    "",
    "2041-03-02 warn East Damp",
]
print(clean_log(RAW))
