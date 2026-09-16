class Log:
    def __init__(self):
        self.lines = []

    def add(self, line):
        self.lines.append(line)


class Station(Log):
    def record(self, line):
        self.add(line)
        return len(self.lines)


station = Station()

print(station.record("wind 18"))
