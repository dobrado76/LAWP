from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "sys.stderr" in src, "warnings belong on sys.stderr so stdout stays pipeable"
assert "file=" in src, "print(value, file=sys.stderr) is how you pick the stream"
assert "sys.exit(" in src, "say the exit code out loud with sys.exit"
