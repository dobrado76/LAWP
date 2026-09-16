import main

import asyncio

assert asyncio.run(main.scan("west")) == "west: clear"
assert asyncio.run(main.sweep()) == "north: clear | east: clear", "both cells, joined with ' | '"
