import os
import sys

print(sys.argv[0], 3, os.environ.get("STATION_MODE", "normal"), "fox")
