COLS = 7
ROWS = 5


def on_grid(x, y):
    return x < COLS and y < ROWS


print(on_grid(3, 2))
