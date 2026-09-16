from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "Path(" in src, "build the path with Path, not with + and a separator"
assert '"/"' not in src, "do not glue the pieces together with a slash of your own"
assert ".stem" in src, "ask the path for its .stem"
assert ".suffix" in src, "ask the path for its .suffix"
assert Path("reports/station.log").read_text(encoding="utf-8").strip() == "ok", "reports/station.log should hold ok"
