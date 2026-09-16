def build_command(station, note):
    return "python report.py --station " + station + " --note " + note


cmd = build_command("ridge", "fox drift; then quiet")

print(len(cmd), cmd[-1] == "fox drift; then quiet")
