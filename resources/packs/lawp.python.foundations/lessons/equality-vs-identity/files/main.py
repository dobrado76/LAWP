def same_object(x, y):
    return x == y


def same_value(x, y):
    return x == y


left = ["fox", "owl"]
right = ["fox", "owl"]
print(same_object(left, right), same_value(left, right))
