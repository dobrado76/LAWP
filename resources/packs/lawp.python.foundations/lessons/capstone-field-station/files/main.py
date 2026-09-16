from pathlib import Path


def load_records(path="station.log"):
    lines = Path(path).read_text(encoding="utf-8").splitlines()
    return [{"animal": line, "x": 0, "y": 0} for line in lines], []


def summarise(records):
    return {"rows": len(records), "animals": 0, "busiest": None, "top_cell": None}


def format_report(summary):
    return "rows=" + str(summary["rows"])


def test_loads_the_fixture():
    load_records("station.log")


test_loads_the_fixture()
records, rejects = load_records()
print(format_report(summarise(records)))
