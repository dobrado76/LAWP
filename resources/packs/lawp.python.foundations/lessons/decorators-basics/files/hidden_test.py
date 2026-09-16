import main

assert main.scan.__name__ == "scan", "functools.wraps should keep the original name"
assert hasattr(main.scan, "__wrapped__"), "scan should be a wrapper around the original function"

before = len(main.CALLS)
assert main.scan("east") == "scanned east", "the wrapper must return the real result"
assert main.CALLS[before:] == ["scan"], "every call should be recorded once"
