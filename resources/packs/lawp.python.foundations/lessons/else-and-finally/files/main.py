def parse_with_report(raw, log):
    try:
        value = int(raw)
    except ValueError:
        log.append("failed")
        value = 0
    log.append("ok")
    return value


trail = []
parse_with_report("warm", trail)
print(trail)
