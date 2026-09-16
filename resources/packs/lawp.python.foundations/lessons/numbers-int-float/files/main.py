def boxes_and_rest(total, per_box):
    return (total / per_box, total % per_box)


boxes, rest = boxes_and_rest(17, 5)
print(boxes, rest)
