class Tag:
    def __init__(self, name):
        self.name = name


print(len({Tag("soil"), Tag("soil"), Tag("wind")}))
