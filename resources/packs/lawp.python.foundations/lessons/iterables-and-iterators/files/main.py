class Route:
    def __init__(self, cells):
        self.cells = cells
        self.pos = 0

    def __iter__(self):
        return self

    def __next__(self):
        raise StopIteration


print(list(Route([1, 2, 3])))
