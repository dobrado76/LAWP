import asyncio


async def read_cell(name):
    await asyncio.sleep(0)
    return f"{name} clear"


async def sweep():
    return "nothing yet"


pending = read_cell("north")
print(type(pending).__name__, asyncio.run(sweep()))
pending.close()
