import main

import asyncio
import inspect

assert inspect.iscoroutinefunction(main.sweep), "sweep should be an async def"
assert asyncio.run(main.sweep()) == "north clear | east clear"

later = main.read_cell("west")
assert inspect.iscoroutine(later), "calling a coroutine function only builds a coroutine"
later.close()
