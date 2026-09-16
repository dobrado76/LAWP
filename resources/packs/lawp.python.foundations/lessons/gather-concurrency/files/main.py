import asyncio

ORDER = []


async def check(name):
    ORDER.append(f"{name}+")
    await asyncio.sleep(0)
    ORDER.append(f"{name}-")
    return name


async def one_at_a_time():
    for name in ("a", "b"):
        await check(name)


async def all_at_once():
    results = []
    for name in ("a", "b"):
        results.append(await check(name))
    return results


async def compare():
    ORDER.clear()
    await one_at_a_time()
    stepwise = list(ORDER)
    ORDER.clear()
    await all_at_once()
    return stepwise, list(ORDER)


stepwise, overlapped = asyncio.run(compare())
print(stepwise == ["a+", "a-", "b+", "b-"], overlapped)
