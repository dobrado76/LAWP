"""The station's grid walk. You did not write it; you are proving it."""

STEPS = {"n": (0, -1), "s": (0, 1), "e": (1, 0), "w": (-1, 0)}


def walk(moves, start=(0, 0), size=5):
    """Follow moves on a size x size grid.

    An unknown letter is ignored. A move that would leave the grid is clamped,
    so the fox stops at the edge instead of walking off it. The start tuple is
    never modified: a new (x, y) tuple comes back.
    """
    x, y = start
    for move in moves:
        dx, dy = STEPS.get(move, (0, 0))
        x = min(max(x + dx, 0), size - 1)
        y = min(max(y + dy, 0), size - 1)
    return (x, y)
