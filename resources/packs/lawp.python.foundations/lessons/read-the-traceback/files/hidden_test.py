import main

assert main.last_line(main.TRACE) == "ZeroDivisionError: division by zero"
assert main.error_type(main.TRACE) == "ZeroDivisionError"

OTHER = """Traceback (most recent call last):
  File "main.py", line 3, in <module>
    open("missing.txt")
FileNotFoundError: no such file or directory
"""

assert main.last_line(OTHER) == "FileNotFoundError: no such file or directory"
assert main.error_type(OTHER) == "FileNotFoundError"
