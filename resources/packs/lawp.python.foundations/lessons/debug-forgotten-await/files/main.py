import asyncio


async def scan(cell):
    await asyncio.sleep(0)
    return f"{cell}: clear"


async def sweep():
    lines = []
    for cell in ("north", "east"):
        lines.append(scan(cell))
    return lines[0]


print(asyncio.run(sweep()))
