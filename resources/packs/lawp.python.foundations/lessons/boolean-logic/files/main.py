def name_or_default(given):
    return given


def can_send(powered, linked):
    return powered or linked


print(name_or_default(""), can_send(True, False))
