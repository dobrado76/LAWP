TRACE = """Traceback (most recent call last):
  File "main.py", line 9, in <module>
    print(average(readings))
  File "main.py", line 5, in average
    return total / len(values)
ZeroDivisionError: division by zero
"""


def last_line(text):
    lines = [line for line in text.splitlines() if line.strip()]
    return lines[0]


def error_type(text):
    return last_line(text).split(":")[0]


print(error_type(TRACE))
