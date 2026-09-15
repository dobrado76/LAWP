import json
from pathlib import Path

LOG = Path.cwd() / "play-log.json"
DIRS = ("north", "south", "east", "west")


def _read():
    if LOG.exists():
        try:
            return json.loads(LOG.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
    return []


def _write(row):
    data = _read()
    data.append(row)
    LOG.write_text(json.dumps(data), encoding="utf-8")


class _Player:
    def move(self, dir):
        if dir not in DIRS:
            _write({"op": "fault", "message": "move dir must be north, south, east, or west"})
            print("Player.move: bad dir")
            return
        _write({"op": "move", "dir": dir})
        print(f"Player.move({dir})")

    def rotate(self, deg):
        if not isinstance(deg, (int, float)) or deg % 90 != 0:
            _write({"op": "fault", "message": "rotate must be a multiple of 90"})
            print("Player.rotate: bad deg")
            return
        _write({"op": "rotate", "deg": deg})
        print(f"Player.rotate({deg})")

    def scale(self, n):
        if not isinstance(n, (int, float)):
            _write({"op": "fault", "message": "scale needs a number"})
            return
        _write({"op": "scale", "n": n})
        print(f"Player.scale({n})")

    def say(self, text):
        _write({"op": "say", "text": str(text)})
        print("Player.say")

    def wait(self, ticks):
        if not isinstance(ticks, int) or ticks < 0:
            _write({"op": "fault", "message": "wait ticks must be a whole number ≥ 0"})
            print("Player.wait: bad ticks")
            return
        _write({"op": "wait", "ticks": ticks})
        print(f"Player.wait({ticks})")

    def __getattr__(self, name):
        def unknown(*_a, **_k):
            _write({"op": "fault", "message": f"unknown method {name}"})
            print(f"Player.{name}: unknown")

        return unknown


Player = _Player()
