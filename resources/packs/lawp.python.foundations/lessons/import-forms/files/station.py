NAME = "Ridge"


def celsius(fahrenheit):
    return round((fahrenheit - 32) * 5 / 9, 1)


def wind_label(kph):
    return "calm" if kph < 12 else "breezy"
