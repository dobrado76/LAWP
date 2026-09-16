from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert 'encoding="utf-8"' in src or "encoding='utf-8'" in src, "name the encoding on every text open"
assert "replace" in src, "write to a temp name, then os.replace it over the real file"
assert not Path("report.tmp").exists(), "report.tmp should be gone once the swap is done"
assert Path("report.txt").read_text(encoding="utf-8").strip() == "total=41", "report.txt should hold the new total only"
