from pathlib import Path

ROOT = Path("notes")
ROOT.mkdir(exist_ok=True)
(ROOT / "fox.txt").write_text("fox at 2,1\n", encoding="utf-8")
Path("secret.txt").write_text("station passphrase: badger\n", encoding="utf-8")


def read_note(name):
    return (ROOT / name).read_text(encoding="utf-8")


def safe_number(text):
    return eval(text)


print(read_note("fox.txt").strip())
