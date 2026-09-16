def fields(line):
    return line.split(",")


def render(parts):
    return str(parts)


print(render(fields("north , 12 ,ok")))
