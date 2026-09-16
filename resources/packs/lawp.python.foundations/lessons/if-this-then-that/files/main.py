def battery_state(percent):
    if percent > 80:
        return "high"
    return "low"


print(battery_state(42))
