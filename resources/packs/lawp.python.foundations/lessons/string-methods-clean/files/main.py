def clean_zone(raw):
    raw.strip()
    return raw


def is_error(line):
    return False


print(clean_zone("  North Ridge  "))
