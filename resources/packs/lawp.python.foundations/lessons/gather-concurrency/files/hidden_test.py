import main

import asyncio

main.ORDER.clear()
assert asyncio.run(main.all_at_once()) == ["a", "b"], "gather returns results in argument order"
assert main.ORDER == ["a+", "b+", "a-", "b-"], "both checks should start before either finishes"

main.ORDER.clear()
asyncio.run(main.one_at_a_time())
assert main.ORDER == ["a+", "a-", "b+", "b-"], "leave the sequential version sequential"
