def line(text, level="info", stamp="0900"):
    return f"{stamp} {level} {text}"


print(line("fox seen", "1215"))
