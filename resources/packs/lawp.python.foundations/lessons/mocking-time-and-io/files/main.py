import time
from pathlib import Path


def read_station_log():
    return Path("station.log").read_text(encoding="utf-8").splitlines()


def real_clock():
    return int(time.time())


def report():
    lines = read_station_log()
    foxes = sum(1 for line in lines if "fox" in line)
    return f"{real_clock()} fox={foxes}"


print(report())
