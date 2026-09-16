def grid_step(pos, direction):
    # moves the fox
    x, y = pos
    if direction == "east":
        return (x + 1, y)
    return (x, y)


print(grid_step((0, 0), "east"))
