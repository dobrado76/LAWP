import { lesson, teach, predict, check, cloze, tf, reflect, ladder, pyCode, importAssert } from './lib.mjs'

/**
 * Craft: the last nine lessons. Everything here is about proving a program
 * rather than writing more of it, and it ends with the field-station capstone.
 */
export function lessonsCraft() {
  const out = []

  out.push({
    doc: lesson({
      id: 'assert-and-aaa',
      courseId: 'craft',
      moduleId: 'prove',
      title: 'Arrange, act, assert',
      skillIds: ['python.craft.tests'],
      estimatedMinutes: 24,
      blocks: [
        teach({
          heading: 'Three beats, one call',
          idea:
            'A test is three beats in a fixed order. **Arrange** an input you already know the answer for, **act** exactly once by calling the thing under test, then **assert** on the value that came back. One call in the middle keeps a failure readable: when the assertion raises, there is only one suspect.',
          bites:
            'This bites the first time you test a function that prints. `print` hands its text to the terminal and gives the caller `None`, so asserting on a printing function compares `None` with the number you wanted and fails no matter how right the screen looked. The screen is not a value. Only the return is something a test can hold, compare, and carry into the next line.',
          code: `def count_rows(rows):
    return len(rows)          # a value the caller can hold


def show_rows(rows):
    print(len(rows))          # the screen gets it; the caller gets None


rows = ["fox at 2,1", "owl at 0,3"]             # arrange
found = count_rows(rows)                        # act
assert found == 2, f"expected 2, got {found}"   # assert

print(show_rows(rows) is None)                  # True - nothing came back`,
          mistake:
            'A common mistake is asserting against a function that only prints, watching it fail, and then loosening the assertion until it goes green. The exercise asks for a counter that **returns** its number and a `test_` function that arranges its own rows, acts once, and asserts on what came back — so the assertion can only fail for a real reason.'
        }),
        predict(
          'print-then-assert',
          'Given\n\n```python\ndef bump(n):\n    print(n + 1)\n```\n\nwhat does `assert bump(1) == 2` do?',
          [
            { id: 'passes', md: 'Passes — the screen shows `2`', misconceptionId: 'test-checks-the-print' },
            { id: 'fails', md: 'Fails — `bump` hands back `None`, and `None == 2` is false' }
          ],
          'fails',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'The `2` on the screen is a side effect, not the value of the call. `bump` has no `return`, so it hands back `None`, and the assertion compares `None` with `2` and raises. Swap `print(n + 1)` for `return n + 1` and the very same assertion starts telling you the truth — and you can still print the result at the call site if a human wants to read it.'
          }
        ),
        cloze(
          'aaa-order',
          'A test {{a}} a fixture, then {{b}} once, then {{c}} on the value that came back.',
          [
            { id: 'a', choices: ['arranges', 'asserts', 'acts'] },
            { id: 'b', choices: ['acts', 'arranges', 'prints'] },
            { id: 'c', choices: ['asserts', 'acts', 'arranges'] }
          ],
          { a: 'arranges', b: 'acts', c: 'asserts' },
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'Arrange, act, assert. Reversing the last two is the usual slip: people assert on a value they have not produced yet, or call the function twice and then cannot say which call the failure came from. Keep the act to a single line and the failure message tells you what went wrong without a debugger.'
          }
        ),
        tf(
          'calling-is-not-checking',
          'A test that calls the function but never compares anything will still fail when the answer is wrong.',
          false,
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'Calling is not checking. A function that returns a wrong number returns it quietly, so a test with no `assert` passes forever and gives you false confidence. The only failure such a test can ever report is a crash. An assertion with a message — `assert found == 2, found` — is what turns a run into a verdict.'
          }
        ),
        pyCode({
          id: 'count-and-test',
          prompt:
            '> Station rows look like `{"animal": "fox", "x": 2, "y": 1}`.\n>\n> 1. `count_sightings(rows, animal)` must **return** how many rows have that `"animal"` — nothing printed inside it.\n> 2. `test_count_sightings()` must arrange its own three-row fixture, act once, and assert on the returned number.\n>\n> Call the test, then print `ok`. Output should be `ok`.',
          equals: 'ok',
          hidden: true,
          hints: ladder(
            'The starter prints the matching rows from inside the counter. A caller cannot compare something that only went to the screen.',
            'Return a number instead: count the rows whose `"animal"` matches, and hand that count back. Then a test can bind it to a name and assert on it.',
            'A different shape: `def loud(rows): return sum(1 for r in rows if r["db"] > 50)`, tested with `found = loud(fixture)` then `assert found == 1, found`.',
            `def count_sightings(rows, animal):
    return sum(1 for row in rows if row["animal"] == animal)


def test_count_sightings():
    rows = [
        {"animal": "fox", "x": 2, "y": 1},
        {"animal": "owl", "x": 0, "y": 3},
        {"animal": "fox", "x": 4, "y": 4},
    ]
    found = count_sightings(rows, "fox")
    assert found == 2, f"expected 2 fox rows, got {found}"


test_count_sightings()
print("ok")`
          )
        })
      ]
    }),
    files: {
      'main.py': `def count_sightings(rows, animal):
    for row in rows:
        if row["animal"] == animal:
            print(row)


def test_count_sightings():
    count_sightings([{"animal": "fox", "x": 1, "y": 1}], "fox")


test_count_sightings()
print("ok")
`,
      'hidden_test.py': importAssert(`from pathlib import Path

LOG = [
    {"animal": "fox", "x": 2, "y": 1},
    {"animal": "owl", "x": 0, "y": 3},
    {"animal": "fox", "x": 4, "y": 4},
]

assert main.count_sightings(LOG, "fox") == 2, "two fox rows in that log"
assert main.count_sightings(LOG, "owl") == 1, "one owl row in that log"
assert main.count_sightings(LOG, "hare") == 0, "no hare rows, so zero"
assert main.count_sightings([], "fox") == 0, "an empty log counts zero"
assert LOG[0] == {"animal": "fox", "x": 2, "y": 1}, "counting must not edit the rows"

src = Path("main.py").read_text(encoding="utf-8")
assert "def test_count_sightings" in src, "write a test_count_sightings() function"
assert "assert" in src, "the test needs an assert, not just a call"
assert main.test_count_sightings() is None, "a passing test returns nothing"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'fixtures-and-hidden-tests',
      courseId: 'craft',
      moduleId: 'prove',
      title: 'Fixtures, and why the hidden test is fair',
      skillIds: ['python.craft.tests'],
      estimatedMinutes: 24,
      blocks: [
        teach({
          heading: 'A fixture is a known day',
          idea:
            'A fixture is input you chose on purpose, small enough to hold in your head, paired with an answer you worked out by hand. It is not whatever happened to be on disk this morning. The whole value of a fixture is that you knew the answer *before* you ran the code, so a mismatch accuses the code instead of confusing you.',
          bites:
            'This bites when a test arranges real data. Real data changes, so the expected answer has to be recomputed by the very function you are testing, and the test quietly agrees with whatever the code does. Three hand-written rows with two of them in the same cell will catch a broken tally forever; a thousand rows from yesterday will catch it only until tomorrow.',
          code: `FIXTURE = [               # a known day: two rows in one cell
    {"animal": "fox", "x": 2, "y": 1},
    {"animal": "owl", "x": 0, "y": 3},
    {"animal": "fox", "x": 2, "y": 1},
]

# The answer was worked out by hand, not by the function under test.
EXPECTED_BUSIEST = (2, 1)
EXPECTED_ROWS = 3

print(len(FIXTURE) == EXPECTED_ROWS)`,
          mistake:
            'A common mistake is treating the hidden test you have been running since lesson two as a trap. It is a contract: it only ever asks for the names and the answers the brief spells out, and it runs your file exactly the way you ran it. The exercise states its four clauses in the prompt, so read them as the specification and build a fixture that satisfies them.'
        }),
        check(
          'what-is-a-fixture',
          'Which of these is a fixture?',
          [
            { id: 'live', md: "Yesterday's whole station log, loaded from disk at the top of the test" },
            { id: 'hand', md: 'Three rows you wrote out, next to the answer you worked out by hand' },
            { id: 'random', md: 'Twenty rows generated with random coordinates each run' }
          ],
          'hand',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'A fixture is chosen input with a known answer. Loading the real log makes the expected value move every day, and generating random rows means a failure cannot be reproduced. Small and deliberate wins: pick the rows that exercise the interesting case — a tie, an empty list, one duplicate cell — and write the answer down as a literal.'
          }
        ),
        tf(
          'hidden-is-a-contract',
          'A fair hidden test may check a name or a behaviour the brief never mentioned.',
          false,
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'The hidden part is the *assertions*, not the requirements. Every name it imports and every answer it expects is stated in the brief, which is why a hidden test is a contract rather than a guessing game. Keeping it hidden only stops you from writing code that pattern-matches the test instead of solving the problem.'
          }
        ),
        predict(
          'empty-clause',
          'Your brief says an empty log reports `None`. You never tried it. What usually happens?',
          [
            { id: 'fine', md: 'Nothing — an empty list is a special case the language handles' },
            { id: 'raises', md: 'The empty case raises, because `max()` of nothing has no answer' }
          ],
          'raises',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'The empty input is the case nobody tries by hand and every contract mentions. Reductions like `max()` and `min()` raise `ValueError` on an empty sequence, and an average divides by zero, so the guard has to be written deliberately. Read the empty clause first and answer it with an early return.'
          }
        ),
        pyCode({
          id: 'busiest-cell',
          prompt:
            '> The contract, in full — nothing else is tested:\n>\n> 1. `FIXTURE` is a module-level list of at least three rows shaped `{"animal": ..., "x": ..., "y": ...}`, with the cell `(2, 1)` appearing twice.\n> 2. `busiest_cell(rows)` returns the `(x, y)` tuple that appears most often.\n> 3. On a tie it returns the smallest tuple.\n> 4. On an empty list it returns `None`.\n>\n> Print `busiest_cell(FIXTURE)`. Output should be `(2, 1)`.',
          equals: '(2, 1)',
          hidden: true,
          hints: ladder(
            'Two jobs here: build the known day as `FIXTURE`, and make `busiest_cell` answer the four clauses above.',
            'Count cells first — `Counter((row["x"], row["y"]) for row in rows)` gives you a tally. The winner is the cell whose tally equals the highest tally, and `min(...)` over those winners settles a tie.',
            'The same two-step on names: `tally = Counter(r["animal"] for r in rows)`, then `best = max(tally.values())`, then `min(n for n, c in tally.items() if c == best)`.',
            `from collections import Counter

FIXTURE = [
    {"animal": "fox", "x": 2, "y": 1},
    {"animal": "owl", "x": 0, "y": 3},
    {"animal": "fox", "x": 2, "y": 1},
]


def busiest_cell(rows):
    if not rows:
        return None
    tally = Counter((row["x"], row["y"]) for row in rows)
    best = max(tally.values())
    return min(cell for cell, seen in tally.items() if seen == best)


print(busiest_cell(FIXTURE))`
          )
        })
      ]
    }),
    files: {
      'main.py': `FIXTURE = []


def busiest_cell(rows):
    return None


print(busiest_cell(FIXTURE))
`,
      'hidden_test.py': importAssert(`assert isinstance(main.FIXTURE, list), "FIXTURE must be a list"
assert len(main.FIXTURE) >= 3, "FIXTURE needs at least three rows"
for row in main.FIXTURE:
    assert set(row) >= {"animal", "x", "y"}, "every fixture row needs animal, x and y"

assert main.busiest_cell(main.FIXTURE) == (2, 1), "the fixture should make (2, 1) the busiest cell"
assert main.busiest_cell([{"animal": "owl", "x": 0, "y": 0}]) == (0, 0), "one row means one busiest cell"
assert main.busiest_cell(
    [
        {"animal": "fox", "x": 1, "y": 1},
        {"animal": "owl", "x": 0, "y": 5},
        {"animal": "owl", "x": 0, "y": 5},
    ]
) == (0, 5), "the repeated cell wins"
assert main.busiest_cell(
    [{"animal": "fox", "x": 3, "y": 0}, {"animal": "owl", "x": 1, "y": 2}]
) == (1, 2), "a tie returns the smallest tuple"
assert main.busiest_cell([]) is None, "an empty log has no busiest cell"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'mocking-time-and-io',
      courseId: 'craft',
      moduleId: 'prove',
      title: 'Hand it the clock',
      skillIds: ['python.craft.tests'],
      estimatedMinutes: 28,
      blocks: [
        teach({
          heading: 'Seams, not surgery',
          idea:
            'A function that calls `time.time()` or opens a file itself has no seam: every run sees a different world, so the same input can give two answers. Adding a parameter for the clock and a parameter for the reader turns each of those into a seam. The real ones stay as defaults, so production code calls `report()` and reads nothing new, while a test calls `report(fake_lines, lambda: 1700)` and gets the same string every time.',
          bites:
            'This bites as a test that passes today and fails in December, or passes on your machine and fails where the log file is missing. Reaching for a patching library to swap `time.time` out from under the module hides the same problem behind more machinery: the dependency is still invisible in the signature, and the patch has to be undone. A parameter is honest — the signature says out loud what the function needs.',
          code: `import time


def real_clock():
    return int(time.time())


def elapsed(started, clock=real_clock):
    return clock() - started


# Production passes nothing and gets the real clock.
# A test passes a clock that cannot drift.
print(elapsed(1000, clock=lambda: 1042))   # 42, forever`,
          mistake:
            'A common mistake is injecting the clock and then calling the real reader anyway, or calling the injected reader twice and asserting on only one of the calls. The exercise gives you a real reader and a real clock already written; your job is to put both behind parameters, read the lines exactly once, and print a line that does not move.'
        }),
        predict(
          'stamp-drift',
          'A test asserts `report()` starts with the current whole second. It passes now. What happens when it runs again a second later?',
          [
            { id: 'stable', md: 'It passes — the value is read from the same clock' },
            { id: 'drifts', md: 'It fails — the clock moved, so the expected string is already stale' }
          ],
          'drifts',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'Anything read from the real world at call time — the clock, the filesystem, the network — makes the expected value a moving target. Either the test recomputes the answer with the same call it is testing (and then proves nothing), or it goes red on its own. Injecting a clock that returns a fixed number makes the answer a constant you can write down.'
          }
        ),
        check(
          'inject-vs-patch',
          'Why prefer passing the clock in over replacing `time.time` globally for the duration of a test?',
          [
            { id: 'faster', md: 'Because a parameter runs faster than a patch' },
            { id: 'honest', md: 'Because the signature then states what the function depends on, and nothing global has to be put back' },
            { id: 'nopatch', md: 'Because patching a module is impossible in Python' }
          ],
          'honest',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'Patching works, and the stdlib ships `unittest.mock` for the cases where you cannot change the code. But it reaches into a module from outside, leaves global state that must be restored, and hides the dependency from anyone reading the signature. A parameter with a real default gives you the same test with none of that: the seam is visible, local, and undoes itself when the call returns.'
          }
        ),
        tf(
          'default-is-production',
          'Giving `clock` a default of the real clock means production code keeps calling `report()` with no arguments.',
          true,
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'That is the whole trick, and it is why dependency injection costs almost nothing here. Callers who do not care keep the short call and get the real world; the test passes its own fakes and gets a fixed world. The default is evaluated once when `def` runs, so hand it the function object itself — not a call to it.'
          }
        ),
        pyCode({
          id: 'inject-clock-and-reader',
          prompt:
            '> `station.log` is read-only, and `read_station_log()` plus `real_clock()` are already written.\n>\n> Rewrite `report` as `report(read_lines=read_station_log, clock=real_clock)`: call `read_lines()` **once**, count the lines containing `"fox"`, and return `f"{clock()} fox={n}"`.\n>\n> Then print the report with your own fakes so the output cannot drift: a reader returning `["fox at 2,1", "owl at 0,3", "fox at 4,4"]` and a clock returning `1700`. Output should be `1700 fox=2`.',
          equals: '1700 fox=2',
          roFiles: ['station.log'],
          hidden: true,
          hints: ladder(
            'The starter reaches for `read_station_log()` and `real_clock()` from inside the function body. Those two calls are the reason the output changes every run.',
            'Move both into the parameter list with the real ones as defaults: `def report(read_lines=read_station_log, clock=real_clock):`. Inside, call the parameters — never the originals.',
            'The same seam elsewhere: `def greet(name, now=real_clock): return f"{now()} hello {name}"`, which a test calls as `greet("fox", now=lambda: 5)`.',
            `import time
from pathlib import Path


def read_station_log():
    return Path("station.log").read_text(encoding="utf-8").splitlines()


def real_clock():
    return int(time.time())


def report(read_lines=read_station_log, clock=real_clock):
    lines = read_lines()
    foxes = sum(1 for line in lines if "fox" in line)
    return f"{clock()} fox={foxes}"


def fake_lines():
    return ["fox at 2,1", "owl at 0,3", "fox at 4,4"]


print(report(fake_lines, lambda: 1700))`
          )
        })
      ]
    }),
    files: {
      'main.py': `import time
from pathlib import Path


def read_station_log():
    return Path("station.log").read_text(encoding="utf-8").splitlines()


def real_clock():
    return int(time.time())


def report():
    lines = read_station_log()
    foxes = sum(1 for line in lines if "fox" in line)
    return f"{real_clock()} fox={foxes}"


print(report())
`,
      'station.log': `fox at 2,1
owl at 0,3
fox at 4,4
hare at 1,1
badger at 3,2
`,
      'hidden_test.py': importAssert(`import inspect

params = inspect.signature(main.report).parameters
assert list(params) == ["read_lines", "clock"], "report(read_lines, clock) - those two names, in that order"
assert params["read_lines"].default is main.read_station_log, "the real reader belongs in the default, not the body"
assert params["clock"].default is main.real_clock, "the real clock belongs in the default, not the body"

calls = []


def fake_read():
    calls.append(1)
    return ["fox 1", "owl 2", "fox 3", "hare 4"]


assert main.report(fake_read, lambda: 900) == "900 fox=2"
assert len(calls) == 1, "call read_lines() exactly once and reuse the lines"
assert main.report(lambda: [], lambda: 0) == "0 fox=0", "no lines means fox=0"
assert main.report(lambda: ["fox"], lambda: 42) == "42 fox=1"

lines = main.read_station_log()
assert isinstance(lines, list) and len(lines) >= 3, "leave the real reader working for production"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'docstrings-contracts',
      courseId: 'craft',
      moduleId: 'prove',
      title: 'The docstring is the contract',
      skillIds: ['python.craft.tests'],
      estimatedMinutes: 24,
      blocks: [
        teach({
          heading: 'What goes in, what comes back, what it raises',
          idea:
            'A docstring is the first string in a function body, and Python keeps it as `__doc__`. That makes it the one piece of prose the language can hand back: `help(grid_step)` prints it, editors show it on hover, and `pydoc` builds a page from it. So write it as a contract rather than a summary — what goes in, what comes back, and what it raises when the input is wrong.',
          bites:
            'This bites when the promise lives in a `#` comment instead. Comments are stripped from the object, so `help()` shows nothing and the next reader has to open the source to learn that an unknown direction raises. Worse, a contract nobody can read gets broken silently: the caller wraps the call in a bare `except`, because it was never told which error to expect.',
          code: `def clamp(value, high):
    """Squeeze value into 0..high.

    Args:
        value: any int.
        high: the largest allowed result; must not be negative.

    Returns:
        An int between 0 and high inclusive.

    Raises:
        ValueError: if high is negative.

    >>> clamp(7, 4)
    4
    """
    if high < 0:
        raise ValueError(f"high must not be negative: {high}")
    return min(max(value, 0), high)


print(clamp.__doc__.splitlines()[0])`,
          mistake:
            'A common mistake is writing `"""Steps the fox."""` and stopping — a restatement of the name that tells a caller nothing new. The other trap is a `>>>` example that was never run: it drifts, and then the documentation lies. The exercise wants a real contract with Args, Returns and Raises sections, plus an example whose output matches what the function actually produces.'
        }),
        check(
          'what-help-shows',
          '`help(grid_step)` prints…',
          [
            { id: 'source', md: 'The whole function body' },
            { id: 'doc', md: 'The signature and the docstring' },
            { id: 'comments', md: 'The `#` comments above the `def`' }
          ],
          'doc',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              '`help()` reads the live object: its signature and its `__doc__`. Comments never reach the object — the compiler drops them — and the body is only available through `inspect.getsource`. That is the practical reason a promise belongs in the docstring: it is the only prose that travels with the function into the interpreter, the editor tooltip, and generated docs.'
          }
        ),
        tf(
          'comment-in-help',
          'A `#` comment written just above `def` shows up in `help()`.',
          false,
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'Comments are for the person editing the line; docstrings are for the person calling the function. Only the docstring becomes `__doc__`, so only the docstring is visible from the outside. If you find yourself explaining the contract in a comment, move those sentences inside the triple quotes and the tooling picks them up for free.'
          }
        ),
        predict(
          'doctest-drift',
          'A docstring shows `>>> grid_step((0, 0), "east")` returning `(1, 1)`, but the function returns `(1, 0)`. Running the module under `doctest` reports…',
          [
            { id: 'silent', md: 'Nothing — examples in prose are not executable' },
            { id: 'failure', md: 'A failure, quoting the expected `(1, 1)` against the actual `(1, 0)`' }
          ],
          'failure',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'The stdlib `doctest` module scans docstrings for `>>>` lines, runs them, and compares the printed result character for character. That turns your examples into tests, which is exactly what stops documentation from drifting away from behaviour. It is also why an example must be copied from a real session rather than typed from memory.'
          }
        ),
        pyCode({
          id: 'grid-step-contract',
          prompt:
            '> Finish `grid_step(pos, direction)` and document it.\n>\n> 1. `pos` is an `(x, y)` tuple; `direction` is one of `"north"`, `"south"`, `"east"`, `"west"`. North decreases `y`, east increases `x`.\n> 2. Return a **new** tuple one cell along.\n> 3. Any other direction raises `ValueError`, and the message must contain the bad name.\n> 4. The docstring needs `Args:`, `Returns:` and `Raises:` sections and at least one `>>>` example whose output matches reality — it is run with `doctest`.\n>\n> Print `grid_step((0, 0), "east")`. Output should be `(1, 0)`.',
          equals: '(1, 0)',
          hidden: true,
          hints: ladder(
            'Two halves: make all four directions work and raise on anything else, then write the contract the caller reads.',
            'A dict of offsets keeps it flat: `{"north": (0, -1), ...}`. If the name is missing, `raise ValueError(f"unknown direction: {direction!r}")` — the `!r` puts the bad name in quotes inside the message.',
            'Copy the example from a real run. `>>> clamp(7, 4)` on its own line, then `4` on the next, is what `doctest` compares against.',
            `def grid_step(pos, direction):
    """Take one step on the station grid.

    Args:
        pos: an (x, y) tuple - the cell you are standing on.
        direction: one of "north", "south", "east", "west".

    Returns:
        A new (x, y) tuple one cell along. pos itself is untouched.

    Raises:
        ValueError: if direction is not one of those four names.

    >>> grid_step((0, 0), "east")
    (1, 0)
    >>> grid_step((2, 3), "north")
    (2, 2)
    """
    steps = {"north": (0, -1), "south": (0, 1), "east": (1, 0), "west": (-1, 0)}
    if direction not in steps:
        raise ValueError(f"unknown direction: {direction!r}")
    dx, dy = steps[direction]
    x, y = pos
    return (x + dx, y + dy)


print(grid_step((0, 0), "east"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def grid_step(pos, direction):
    # moves the fox
    x, y = pos
    if direction == "east":
        return (x + 1, y)
    return (x, y)


print(grid_step((0, 0), "east"))
`,
      'hidden_test.py': importAssert(`import doctest

assert main.grid_step((0, 0), "east") == (1, 0)
assert main.grid_step((2, 3), "west") == (1, 3)
assert main.grid_step((2, 3), "north") == (2, 2), "north decreases y"
assert main.grid_step((2, 3), "south") == (2, 4), "south increases y"

start = (1, 1)
assert main.grid_step(start, "east") == (2, 1)
assert start == (1, 1), "hand back a new tuple; do not touch pos"

try:
    main.grid_step((0, 0), "up")
except ValueError as err:
    assert "up" in str(err), "name the bad direction in the message"
else:
    raise AssertionError("an unknown direction has to raise ValueError")

doc = main.grid_step.__doc__ or ""
for needed in ("Args:", "Returns:", "Raises:", ">>>", "ValueError"):
    assert needed in doc, "the docstring is missing " + needed
assert len(doc.split()) >= 25, "state the whole contract, not a restatement of the name"

result = doctest.testmod(main, verbose=False)
assert result.attempted >= 1, "add at least one >>> example to the docstring"
assert result.failed == 0, "a >>> example does not match what the function returns"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'logging-not-print',
      courseId: 'craft',
      moduleId: 'diagnose',
      title: 'Logging has a volume knob',
      skillIds: ['python.craft.debug'],
      estimatedMinutes: 26,
      blocks: [
        teach({
          heading: 'Levels and destinations',
          idea:
            'A log record carries a **level** — debug, info, warning, error, critical — and goes to a **destination** you configure once, at the edge of the program. That gives you two knobs `print` does not have: turn the volume down to warnings in normal use and up to debug while you are hunting a bug, and send the stream to a file instead of the screen without touching a single call site.',
          bites:
            'This bites hardest in code other people call. A library that prints writes into its caller\'s output whether the caller wanted it or not — it corrupts a program whose stdout is a report, and there is no way to switch it off short of editing the library. `logging` inverts that: the library records, the application decides where the records go and how loud they are.',
          code: `import logging

logging.basicConfig(
    filename="run.log",
    level=logging.DEBUG,
    format="%(levelname)s %(message)s",   # no timestamp, so the file is predictable
)
log = logging.getLogger("station")

log.debug("checking cell %s,%s", 2, 1)   # only in the file when level is DEBUG
log.warning("cell %s,%s is off the grid", 9, 0)
print("2")                               # the answer - the one thing stdout owes`,
          mistake:
            'A common mistake is calling `logging.warning(...)` with an f-string you built yourself, or leaving a debugging `print` in beside the log call. The exercise grades both sides: the log file has to contain a warning naming the offending cell and one info summary, and stdout has to contain exactly one thing — the number the function returned.'
        }),
        check(
          'library-must-not-print',
          'A library function you wrote is being called by a script whose stdout is piped into another tool. Why is `print("skipped a row")` a bug?',
          [
            { id: 'slow', md: 'Because printing is slower than logging' },
            { id: 'stream', md: 'Because it injects your text into the caller\'s data stream, and the caller cannot turn it off' },
            { id: 'never', md: 'Because `print` cannot write text longer than one line' }
          ],
          'stream',
          {
            skillIds: ['python.craft.debug'],
            explainMd:
              'Stdout belongs to the application, not to the library. A stray `print` becomes a row in someone\'s report or a line in someone\'s JSON, and the only fix is editing your code. A log record goes wherever the application configured — a file, stderr, nowhere at all — and the level decides whether it is emitted, so the same library is quiet in production and chatty under investigation.'
          }
        ),
        predict(
          'level-filter',
          'With `level=logging.WARNING` configured, which calls reach the destination: `log.debug(...)`, `log.info(...)`, `log.warning(...)`?',
          [
            { id: 'all', md: 'All three — the level only changes the prefix' },
            { id: 'warn', md: 'Only the warning; the other two are dropped' }
          ],
          'warn',
          {
            skillIds: ['python.craft.debug'],
            explainMd:
              'The level is a threshold, not a label: anything below it is discarded before it is formatted. That is what makes it safe to leave a `log.debug` on every interesting line — it costs almost nothing while the threshold is higher, and raising the threshold to `DEBUG` in one place turns the whole trail back on without you editing any call.'
          }
        ),
        tf(
          'lazy-format',
          '`log.debug("cell %s,%s", x, y)` lets logging skip building the message when debug records are switched off.',
          true,
          {
            skillIds: ['python.craft.debug'],
            explainMd:
              'Passing the values as arguments defers the formatting until a handler actually wants the record, so a filtered-out debug line costs one level comparison. Building the text yourself with an f-string does the work first and throws it away — harmless once, wasteful inside a loop over a large log, and it also loses the structured arguments that some handlers record separately.'
          }
        ),
        pyCode({
          id: 'log-the-scan',
          prompt:
            '> Move the noise off stdout.\n>\n> 1. Configure logging once at module level: `filename="run.log"`, level `DEBUG`, format `"%(levelname)s %(message)s"`.\n> 2. `check_rows(rows)` returns how many rows sit inside a 5×5 grid (`0 <= x < 5` and `0 <= y < 5`).\n> 3. Every off-grid row gets a `warning` naming its `x` and `y`; the end gets one `info` summary.\n> 4. Exactly one `print` survives in the file: the returned number.\n>\n> Print `check_rows(ROWS)`. Output should be `2`.',
          equals: '2',
          hidden: true,
          hints: ladder(
            'The starter prints three different things. Two of them are diagnostics, and only one is the answer.',
            '`logging.basicConfig(filename="run.log", level=logging.DEBUG, format="%(levelname)s %(message)s")` at the top, then `log = logging.getLogger("station")`, then swap each diagnostic `print` for `log.warning(...)` or `log.info(...)`.',
            'The same move elsewhere: `log.warning("battery low: %s%%", pct)` replaces `print("battery low:", pct)` and stops polluting a report that is being piped somewhere.',
            `import logging

logging.basicConfig(
    filename="run.log",
    level=logging.DEBUG,
    format="%(levelname)s %(message)s",
)
log = logging.getLogger("station")

ROWS = [{"x": 0, "y": 0}, {"x": 9, "y": 0}, {"x": 4, "y": 4}]


def check_rows(rows):
    good = 0
    for row in rows:
        if 0 <= row["x"] < 5 and 0 <= row["y"] < 5:
            log.debug("cell %s,%s is on the grid", row["x"], row["y"])
            good += 1
        else:
            log.warning("cell %s,%s is off the 5x5 grid", row["x"], row["y"])
    log.info("%s of %s rows are on the grid", good, len(rows))
    return good


print(check_rows(ROWS))`
          )
        })
      ]
    }),
    files: {
      'main.py': `ROWS = [{"x": 0, "y": 0}, {"x": 9, "y": 0}, {"x": 4, "y": 4}]


def check_rows(rows):
    good = 0
    for row in rows:
        if 0 <= row["x"] < 5 and 0 <= row["y"] < 5:
            good += 1
        else:
            print("off grid:", row["x"], row["y"])
    print("checked", len(rows), "rows")
    return good


print(check_rows(ROWS))
`,
      'hidden_test.py': importAssert(`import logging
from pathlib import Path

assert main.check_rows([{"x": 0, "y": 0}]) == 1, "an on-grid row counts"
assert main.check_rows([{"x": 9, "y": 0}]) == 0, "an off-grid row does not"
assert main.check_rows([]) == 0, "no rows, nothing on the grid"

logging.shutdown()
written = Path("run.log").read_text(encoding="utf-8")
assert "WARNING" in written, "an off-grid row deserves a WARNING record"
assert "INFO" in written, "log one INFO summary at the end"
assert "9" in written, "name the offending cell in the warning"

src = Path("main.py").read_text(encoding="utf-8")
assert "logging" in src, "use the logging module, not print, for diagnostics"
assert src.count("print(") == 1, "one print for the answer; every diagnostic goes to the log"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'measure-then-change',
      courseId: 'craft',
      moduleId: 'diagnose',
      title: 'Measure, then change the algorithm',
      skillIds: ['python.craft.perf'],
      estimatedMinutes: 28,
      blocks: [
        teach({
          heading: 'The clock first, the rewrite second',
          idea:
            'Optimising without measuring is guessing with extra steps. `time.perf_counter()` around a block gives you a before-and-after number, and `timeit` runs a small snippet many times so the answer is not one noisy sample. Measure, write the number down, change one thing, measure again. If the second number is not better, you learned something and you can put the code back.',
          bites:
            'This bites when the measurement points at the *data structure*, not the loop. Asking `name in names` where `names` is a list walks it item by item: every extra name is extra work, so a thousand lookups over a thousand names is a million comparisons. A set answers the same question by hashing the name once and looking in one place, so the cost barely moves as the set grows. That is a different algorithm, not a faster loop.',
          code: `import timeit

setup = "names = [f'n{i}' for i in range(5000)]; wanted = set(names)"
as_list = timeit.timeit("'n4999' in names", setup=setup, number=2000)
as_set = timeit.timeit("'n4999' in wanted", setup=setup, number=2000)

# The exact seconds differ per machine; the shape of the answer does not.
print(as_set < as_list)   # True - one hash beats 5000 comparisons`,
          mistake:
            'A common mistake is tuning the loop body — a comprehension here, a local alias there — while the containment test stays linear. Micro-edits win percentages; changing the container changes the exponent. The exercise keeps the printed answer exactly as it is and grades the structure instead, so you can prove the change without chasing a stopwatch reading.'
        }),
        check(
          'measure-first',
          'A report feels slow. What is the first move?',
          [
            { id: 'rewrite', md: 'Rewrite the biggest loop as a comprehension and see if it feels better' },
            { id: 'measure', md: 'Time the parts, so you change the one that actually costs' },
            { id: 'cache', md: 'Add a cache everywhere, since caching is always faster' }
          ],
          'measure',
          {
            skillIds: ['python.craft.perf'],
            explainMd:
              'Intuition about speed is unreliable, and the slow part is very often not the part you were looking at. A `perf_counter` around each stage costs two lines and turns the argument into a number. Without that number you cannot tell whether your change helped, and you cannot tell when to stop — both of which are how a "quick optimisation" turns into a day.'
          }
        ),
        predict(
          'list-vs-set-cost',
          '`names` is a list of 10,000 strings. Roughly how much work does `"dragon" in names` do when `"dragon"` is absent?',
          [
            { id: 'one', md: 'One lookup — Python indexes the list by value' },
            { id: 'ten-thousand', md: 'Ten thousand comparisons — it walks to the end before giving up' }
          ],
          'ten-thousand',
          {
            skillIds: ['python.craft.perf'],
            explainMd:
              'A list keeps order, not an index by value, so `in` has to compare against each item until it finds a match or runs out. The absent case is the worst case: every element, every time. That is O(n) per lookup, and inside a loop over m rows it becomes O(n·m) — the shape that turns a fast script slow the week the data grows.'
          }
        ),
        tf(
          'set-is-sorted',
          'A set answers `in` quickly because it keeps its items sorted.',
          false,
          {
            skillIds: ['python.craft.perf'],
            explainMd:
              'A set is unordered; it hashes each item and stores it in a slot chosen from that hash. Membership hashes the thing you are asking about and looks in the matching slot, which is why the cost is roughly constant rather than proportional to the size. The price is that the item must be hashable and that iteration order is not something you may rely on.'
          }
        ),
        pyCode({
          id: 'known-names-fast',
          prompt:
            '> The answer this program prints is already right — do not change it. Change the algorithm behind it.\n>\n> 1. `KNOWN` must be a **set** of the station\'s known animal names.\n> 2. `is_known(name)` returns whether `name` is in `KNOWN`, with no loop and no scan.\n> 3. `count_known(rows)` still returns how many names in `rows` are known.\n>\n> Print `count_known(SIGHTINGS)`. Output should be `4`.',
          equals: '4',
          hidden: true,
          hints: ladder(
            'Read `is_known` and count what it does for a name that is not there: one comparison per known animal, every single call.',
            'Membership is a built-in question. Store the names in a set with `{...}` and let `return name in KNOWN` do the hashing — no loop at all.',
            'The same swap on a different job: `SEEN = set()` then `if cell in SEEN` instead of keeping a `seen` list and scanning it each time round.',
            `KNOWN = {"fox", "owl", "hare", "badger", "stoat", "heron"}
SIGHTINGS = ["fox", "dragon", "owl", "fox", "griffin", "hare"]


def is_known(name):
    return name in KNOWN


def count_known(rows):
    return sum(1 for row in rows if is_known(row))


print(count_known(SIGHTINGS))`
          )
        })
      ]
    }),
    files: {
      'main.py': `KNOWN = ["fox", "owl", "hare", "badger", "stoat", "heron"]
SIGHTINGS = ["fox", "dragon", "owl", "fox", "griffin", "hare"]


def is_known(name):
    for known in KNOWN:
        if known == name:
            return True
    return False


def count_known(rows):
    return sum(1 for row in rows if is_known(row))


print(count_known(SIGHTINGS))
`,
      'hidden_test.py': importAssert(`assert isinstance(main.KNOWN, (set, frozenset)), "KNOWN has to be a set, not a list"
assert {"fox", "owl", "hare"} <= set(main.KNOWN), "keep the station's known names"

assert main.is_known("fox") is True
assert main.is_known("dragon") is False
assert main.count_known(["fox", "dragon", "owl"]) == 2
assert main.count_known([]) == 0


class Counted(str):
    """A name that reports every == it takes part in."""

    probes = 0

    def __eq__(self, other):
        Counted.probes += 1
        return str.__eq__(self, other)

    def __hash__(self):
        return str.__hash__(self)


Counted.probes = 0
main.is_known(Counted("dragon"))
assert Counted.probes <= 1, "a set lookup hashes once; it must not walk the names"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'security-paths-and-eval',
      courseId: 'craft',
      moduleId: 'diagnose',
      title: 'Refuse the string you were handed',
      skillIds: ['python.security'],
      estimatedMinutes: 30,
      blocks: [
        teach({
          heading: 'Untrusted text is not code, and a name is not a path',
          idea:
            'Two habits close most of the holes a small tool can have. Never hand untrusted text to `eval` or `exec`: they run it with all your privileges, so `"__import__(\'shutil\').rmtree(\'.\')"` is a valid expression. And never trust a filename: resolve it to an absolute path first, then check that the folder you allow is one of its parents, and refuse it otherwise.',
          bites:
            'This bites as path traversal. `"../../secrets.txt"` is a perfectly ordinary-looking name, and `root / name` happily builds a path that climbs out of the folder you meant to serve. Checking the raw string for `".."` is not enough either — `"sub/../../x"` hides the climb in the middle, and a symlink hides it entirely. Only the resolved path tells the truth, because resolving is what collapses `..` and follows links.',
          code: `from pathlib import Path

root = Path("notes").resolve()


def inside(name):
    target = (root / name).resolve()
    return target == root or root in target.parents


print(inside("fox.txt"))            # True
print(inside("../secret.txt"))      # False
print(inside("sub/../../secret"))   # False - resolve collapsed the climb`,
          mistake:
            'A common mistake is validating before resolving: `if ".." in name` rejects the obvious attempt, passes the clever one, and rejects innocent names too. The exercise wants the check after `resolve()`, a `ValueError` for anything that escapes, and a number parser that refuses text it cannot read instead of evaluating it.'
        }),
        predict(
          'eval-untrusted',
          'A note field arrives as the text `__import__("os").listdir(".")`. What does `eval` on that text do?',
          [
            { id: 'text', md: 'Returns the characters — `eval` only understands numbers' },
            { id: 'runs', md: 'Imports `os` and lists the directory, because it is a legal expression' }
          ],
          'runs',
          {
            skillIds: ['python.security'],
            explainMd:
              '`eval` compiles and runs whatever you give it, with your process\'s permissions. An expression can import modules, read files, and reach the network, so any untrusted text becomes code the moment it touches `eval`. When you genuinely need a literal back out of a string, `int()`, `float()`, `json.loads()` and `ast.literal_eval()` each parse a value and refuse anything that is not one.'
          }
        ),
        check(
          'dotdot-check',
          'Is rejecting any name that contains `".."` a sufficient traversal guard?',
          [
            {
              id: 'enough',
              md: 'Yes — a path is a string, so filtering the dangerous characters filters the danger',
              misconceptionId: 'paths-are-just-strings'
            },
            { id: 'resolve', md: 'No — resolve the path first and check its parents, because the climb can also come from a link or an absolute name' }
          ],
          'resolve',
          {
            skillIds: ['python.security'],
            explainMd:
              'A path is a place on a filesystem, and only the filesystem can say where a name lands. `resolve()` collapses `..`, follows symlinks, and makes the path absolute — after that, `root in target.parents` is a question about location rather than spelling. String filtering also has false positives: a legitimate file called `notes..txt` is not an attack.'
          }
        ),
        tf(
          'absolute-name',
          'An absolute name like `/etc/passwd` passed as the filename also escapes a naive `root / name`.',
          true,
          {
            skillIds: ['python.security'],
            explainMd:
              'Joining an absolute path onto a root discards the root — `Path("notes") / "/etc/passwd"` is just `/etc/passwd`. That is documented behaviour, not a bug, and it is a second reason the guard has to look at the resolved result rather than at the pieces you glued together. One check after `resolve()` covers `..`, links, and absolute names at once.'
          }
        ),
        pyCode({
          id: 'safe-read-and-parse',
          prompt:
            '> The program already creates `notes/fox.txt` and a `secret.txt` outside it. Keep that setup.\n>\n> 1. `read_note(name)` resolves `ROOT / name`, and returns the text only when the resolved path is `ROOT` itself or has `ROOT` among its parents.\n> 2. Anything that escapes raises `ValueError`. A name that stays inside but does not exist must still raise `FileNotFoundError`.\n> 3. `safe_number(text)` returns the whole number in `text`, or `None` when it is not one. No `eval`, no `exec`.\n>\n> Print `read_note("fox.txt").strip()`. Output should be `fox at 2,1`.',
          equals: 'fox at 2,1',
          hidden: true,
          hints: ladder(
            'The starter joins the name straight onto `ROOT` and calls `eval` on whatever text it is handed. Both of those trust the caller completely.',
            'Resolve both sides: `root = ROOT.resolve()` and `target = (root / name).resolve()`. Allow it when `target == root or root in target.parents`, and `raise ValueError(...)` otherwise. For the number, `try: return int(text.strip())` and answer `None` in the `except ValueError`.',
            'The same guard for a write: `dest = (root / name).resolve()`, refuse unless `root in dest.parents`, and only then `dest.write_text(...)` — so a crafted name cannot overwrite something outside the folder.',
            `from pathlib import Path

ROOT = Path("notes")
ROOT.mkdir(exist_ok=True)
(ROOT / "fox.txt").write_text("fox at 2,1\\n", encoding="utf-8")
Path("secret.txt").write_text("station passphrase: badger\\n", encoding="utf-8")


def read_note(name):
    """Read one note from ROOT, or refuse to leave it."""
    root = ROOT.resolve()
    target = (root / name).resolve()
    if target != root and root not in target.parents:
        raise ValueError(f"refusing to read outside the notes folder: {name!r}")
    return target.read_text(encoding="utf-8")


def safe_number(text):
    """Return the whole number in text, or None when it is not one."""
    try:
        return int(text.strip())
    except (TypeError, ValueError):
        return None


print(read_note("fox.txt").strip())`
          )
        })
      ]
    }),
    files: {
      'main.py': `from pathlib import Path

ROOT = Path("notes")
ROOT.mkdir(exist_ok=True)
(ROOT / "fox.txt").write_text("fox at 2,1\\n", encoding="utf-8")
Path("secret.txt").write_text("station passphrase: badger\\n", encoding="utf-8")


def read_note(name):
    return (ROOT / name).read_text(encoding="utf-8")


def safe_number(text):
    return eval(text)


print(read_note("fox.txt").strip())
`,
      'hidden_test.py': importAssert(`import re
from pathlib import Path

assert main.read_note("fox.txt").strip() == "fox at 2,1", "a name inside the root still reads"

for bad in ("../secret.txt", "../../secret.txt", "sub/../../secret.txt"):
    try:
        main.read_note(bad)
    except ValueError:
        pass
    else:
        raise AssertionError("read_note must refuse " + bad)

try:
    main.read_note("missing.txt")
except FileNotFoundError:
    pass
else:
    raise AssertionError("a missing name inside the root is FileNotFoundError, not a refusal")

assert main.safe_number("41") == 41
assert main.safe_number(" -7 ") == -7
assert main.safe_number("2 + 2") is None, "an expression is not a number"
assert main.safe_number("__import__('os').getcwd()") is None, "never evaluate that"

src = Path("main.py").read_text(encoding="utf-8")
assert not re.search(r"(?<![\\w.])eval\\s*\\(", src), "eval is never the answer here"
assert not re.search(r"(?<![\\w.])exec\\s*\\(", src), "exec is never the answer here"
assert "resolve()" in src, "resolve the path before you judge it"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-test-the-fox',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'Transfer: tests for the walk',
      skillIds: ['python.craft.tests'],
      estimatedMinutes: 30,
      mastery: { requiresTransfer: true, minCorrectIndependent: 1 },
      creation: {
        id: 'field-station',
        step: 2,
        briefMd:
          'Your field-station tool can already print a report. Now it gets a test suite. `walk.py` holds the station grid walk, written by someone else and read-only. You write the tests that prove it — the four behaviours its docstring promises, each with its own fixture — and you keep them in the tool.'
      },
      blocks: [
        teach({
          heading: 'Test somebody else\'s function',
          idea:
            'Testing code you did not write starts with reading its contract, not its body. `walk.py` promises four things: a known number of steps lands on a known cell, a move that would leave the grid is clamped to the edge, an unknown letter is ignored, and the start tuple comes back untouched. Each promise becomes one test with its own fixture and its own name, so a failure tells you which promise broke.',
          bites:
            'This bites when a test only calls the function. A call proves the code does not crash; it says nothing about the answer. The way to tell the difference is to break the implementation on purpose: if you replace `walk` with a version that never moves and your suite still reports success, the suite was decoration. Every real test fails for exactly one reason, and you should be able to say which.',
          code: `from walk import walk


def test_walks_west():
    assert walk(["w"], start=(3, 3)) == (2, 3)


def test_clamps_at_the_top_edge():
    assert walk(["n"] * 4, start=(1, 1)) == (1, 0)


test_walks_west()
test_clamps_at_the_top_edge()
print("2 tests ok")`,
          mistake:
            'A common mistake is one giant `test_walk()` with eight assertions in it: the first failure hides the other seven, and the name tells you nothing. The other trap is a test whose expected value is computed by calling `walk` a second time — that always agrees with the code. Name each test after the promise it checks, and write the expected cell as a literal you worked out yourself.'
        }),
        check(
          'sabotage',
          'You swap the real `walk` for one that ignores every move and returns `start`. Your suite still reports success. What does that tell you?',
          [
            { id: 'good', md: 'That the implementation was never the problem' },
            { id: 'weak', md: 'That the suite calls the function without checking its answer' },
            { id: 'lucky', md: 'That the fixtures happened to start on the right cells' }
          ],
          'weak',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'A suite that cannot tell a working function from a broken one has no information in it. Deliberately breaking the code — a mutation, in testing jargon — is the cheapest way to audit your own tests: every assertion that matters should go red. If nothing changes colour, the assertions are either missing or comparing the code against itself.'
          }
        ),
        cloze(
          'one-reason',
          'Each test gets {{a}} fixture and a name saying {{b}}, so a red test points at one broken promise.',
          [
            { id: 'a', choices: ['its own', 'a shared', 'the real'] },
            { id: 'b', choices: ['which promise it checks', 'which line it runs', 'how fast it is'] }
          ],
          { a: 'its own', b: 'which promise it checks' },
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'Independent fixtures mean one test cannot leave state that changes another, and a descriptive name means the failure report is already half of the diagnosis. `test_clamps_at_the_east_edge` failing tells you where to look before you have read a single line of the traceback; `test_walk` failing tells you only that something, somewhere, is wrong.'
          }
        ),
        tf(
          'clamp-promise',
          'If the contract says a move off the grid is clamped, then nine east moves on a five-wide grid must still end inside it.',
          true,
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'Clamping means the fox stops at the edge instead of walking off, so the far edge is the answer for any number of moves past it. That makes the over-walk a perfect test case: the expected cell is the edge, it is easy to compute by hand, and an implementation that forgot the bound gives a coordinate the grid does not contain.'
          }
        ),
        pyCode({
          id: 'four-tests',
          prompt:
            '> `walk.py` is read-only — read its docstring first. Import it with exactly `from walk import walk`, then write four tests, each arranging its own fixture and asserting on the returned cell:\n>\n> - `test_walks_east()` — three `"e"` moves from `(0, 0)` land on `(3, 0)`.\n> - `test_stays_on_the_grid()` — nine `"e"` moves on the 5-wide grid still end at `x = 4`.\n> - `test_ignores_unknown_move()` — an unknown letter leaves the fox where it was.\n> - `test_returns_a_new_tuple()` — the returned tuple is not the `start` object, and `start` is unchanged.\n>\n> Call all four, then print `4 tests ok`. The hidden test also sabotages `walk` and expects your suite to notice.',
          equals: '4 tests ok',
          roFiles: ['walk.py'],
          hidden: true,
          hints: ladder(
            'The starter calls `walk` and announces success. Nothing in it compares a result to a cell you worked out yourself.',
            'One function per promise, each ending in an `assert`. `walk(["e", "e", "e"])` should equal `(3, 0)`; give the assert a message like `assert landed == (3, 0), landed` so a failure shows the real value.',
            'Over-walking a different edge: `assert walk(["n"] * 3, start=(2, 1)) == (2, 0)`, because north is clamped at `y = 0`.',
            `from walk import walk


def test_walks_east():
    landed = walk(["e", "e", "e"])
    assert landed == (3, 0), landed


def test_stays_on_the_grid():
    assert walk(["e"] * 9) == (4, 0), "east is clamped at x = 4"
    assert walk(["n"] * 3) == (0, 0), "north is clamped at y = 0"


def test_ignores_unknown_move():
    assert walk(["z"], start=(2, 2)) == (2, 2), "an unknown letter is a no-op"


def test_returns_a_new_tuple():
    start = (1, 1)
    landed = walk(["e"], start=start)
    assert landed == (2, 1), landed
    assert landed is not start, "walk should hand back a new tuple"
    assert start == (1, 1), start


test_walks_east()
test_stays_on_the_grid()
test_ignores_unknown_move()
test_returns_a_new_tuple()
print("4 tests ok")`
          )
        }),
        reflect(
          'suite-audit',
          'Which of your four tests would survive a `walk` that ignores the grid bounds, and what does that say about the assertion you wrote?'
        )
      ]
    }),
    files: {
      'main.py': `from walk import walk

# TODO: four tests, each with its own arrange / act / assert.


def test_walks_east():
    walk(["e", "e", "e"])   # it ran. It proved nothing.


test_walks_east()
print("1 test ok")
`,
      'walk.py': `"""The station's grid walk. You did not write it; you are proving it."""

STEPS = {"n": (0, -1), "s": (0, 1), "e": (1, 0), "w": (-1, 0)}


def walk(moves, start=(0, 0), size=5):
    """Follow moves on a size x size grid.

    An unknown letter is ignored. A move that would leave the grid is clamped,
    so the fox stops at the edge instead of walking off it. The start tuple is
    never modified: a new (x, y) tuple comes back.
    """
    x, y = start
    for move in moves:
        dx, dy = STEPS.get(move, (0, 0))
        x = min(max(x + dx, 0), size - 1)
        y = min(max(y + dy, 0), size - 1)
    return (x, y)
`,
      'hidden_test.py': importAssert(`from pathlib import Path

NAMES = (
    "test_walks_east",
    "test_stays_on_the_grid",
    "test_ignores_unknown_move",
    "test_returns_a_new_tuple",
)

src = Path("main.py").read_text(encoding="utf-8")
assert "from walk import walk" in src, "import it with: from walk import walk"

for name in NAMES:
    assert callable(getattr(main, name, None)), "expected a function called " + name
    getattr(main, name)()


def broken(moves, start=(0, 0), size=5):
    """A walk that never moves. A real suite must notice."""
    return start


main.walk = broken
caught = 0
for name in NAMES:
    try:
        getattr(main, name)()
    except AssertionError:
        caught += 1
assert caught >= 3, "a walk that never moves should fail at least three of your tests"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'capstone-field-station',
      courseId: 'craft',
      moduleId: 'ship',
      title: 'Capstone: the field station, tested',
      skillIds: ['python.craft.tests', 'python.io.files', 'python.craft.debug'],
      estimatedMinutes: 60,
      creation: {
        id: 'field-station',
        step: 3,
        briefMd:
          'The last step. Your tool now loads the station log itself, keeps the rows it can read and the lines it cannot, summarises the day, prints one line a human can read, and ships with its own tests. That is the whole field station: a loader, a report, and the proof. Export it and it runs anywhere Python does.'
      },
      blocks: [
        teach({
          heading: 'Load, report, prove',
          idea:
            'A tool worth keeping has three layers, and they are worth keeping apart. A **loader** turns messy text into clean records and hands back what it could not read instead of hiding it. A **summary** is a pure function: records in, a small dict out, no files and no printing. A **formatter** turns that dict into one line. Only the last layer touches the screen, which is exactly why the first two are easy to test.',
          bites:
            'This bites when the layers fuse. A function that opens the file, tallies, and prints as it goes cannot be tested without a real log on disk and cannot be reused by anything that wants the numbers rather than the text. Splitting them costs three `def`s and buys you a fixture-sized test for every rule — the blank line, the comment, the row whose coordinate is not a number.',
          code: `def summarise(records):
    """records in, one small dict out. No files, no print."""
    if not records:
        return {"rows": 0, "animals": 0, "busiest": None, "top_cell": None}
    ...


def format_report(summary):
    """One line a human reads and a test compares."""
    ...


records, rejects = load_records()        # the only layer that touches disk
print(format_report(summarise(records)))  # the only layer that prints`,
          mistake:
            'A common mistake is dropping the lines you cannot parse. Silence is the worst failure mode a log tool has: the report looks fine and the station never learns that a row was lost. Hand the rejects back so the caller can decide, and write a test that pins the exact list.'
        }),
        teach({
          heading: 'Ties are part of the contract',
          idea:
            'Every summary that picks a winner needs a documented answer for a tie, and one for no data at all. Two animals seen once each is not an error; it is a Tuesday. If the rule is not written down, the answer depends on dictionary order and your test becomes a coin toss you happen to be winning today.',
          bites:
            'This bites when the fix is "whatever `max` returned last time". `max` over a `Counter` picks by count and breaks ties by whichever key it met first, so adding a row at the top of the log can silently change the reported winner. Choosing the *alphabetically smallest* name — and the *smallest* `(x, y)` tuple — makes the answer a property of the data rather than of the insertion order.',
          code: `from collections import Counter

tally = Counter(["owl", "fox"])          # one each: a tie
best = max(tally.values())               # 1
winner = min(name for name, seen in tally.items() if seen == best)
print(winner)                            # fox - documented, not accidental`,
          mistake:
            'A common mistake is testing only the happy path, where one animal clearly wins. The brief below spells out both edges — the tie and the empty log — and the hidden test checks each of them, so write the guard and the tie-break before you write the tests that pin them.'
        }),
        check(
          'why-return-rejects',
          '`load_records` meets a line it cannot parse. What should it do?',
          [
            { id: 'skip', md: 'Skip it quietly — the report should not be interrupted' },
            { id: 'raise', md: 'Raise, so the whole run stops on the first bad row' },
            { id: 'collect', md: 'Keep it in a rejects list and hand that back with the records' }
          ],
          'collect',
          {
            skillIds: ['python.craft.debug'],
            explainMd:
              'Silently skipping loses information the station needs, and raising throws away the ninety-nine good rows because of one bad one. Returning both lists lets the caller choose: print the report and warn about two rejects, or refuse to report when there are more than ten. It is also the only one of the three you can pin with a test, because the rejects are a value rather than an absence.'
          }
        ),
        predict(
          'tie-order',
          'Two animals appear once each, and you pick the winner with `max(tally, key=tally.get)`. What decides the answer?',
          [
            { id: 'alpha', md: 'Alphabetical order — `max` sorts the keys' },
            { id: 'first', md: 'Whichever key `max` met first, so the order of the log decides' }
          ],
          'first',
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              '`max` keeps the first item with the highest key value, and dictionary iteration follows insertion order, so the winner is decided by which row happened to come first in the file. Reordering the log would change your report without changing the data. Pick the winners whose count equals the best count and then apply a written rule — smallest name, smallest cell — so the answer is reproducible.'
          }
        ),
        tf(
          'summary-is-pure',
          '`summarise(records)` should be testable without any file on disk.',
          true,
          {
            skillIds: ['python.craft.tests'],
            explainMd:
              'It takes a list and returns a dict, so a three-row literal in the test is a complete input. That is what makes the tie rule and the empty case cheap to pin: no fixture file, no cleanup, no ordering between tests. Keep the file reading in the loader, where a small temporary log written by the test itself is enough to cover the parsing rules.'
          }
        ),
        pyCode({
          id: 'field-station-tool',
          prompt:
            '> Build the whole tool in `main.py`. `station.log` is read-only.\n>\n> **`load_records(path="station.log")` → `(records, rejects)`**\n> - Skip blank lines and lines starting with `#`; they are not rejects.\n> - A good row splits on `,` into three fields and the last two are integers: keep `{"animal": str, "x": int, "y": int}`, in file order.\n> - Anything else goes into `rejects` as the stripped line.\n>\n> **`summarise(records)` → dict** with `"rows"`, `"animals"` (distinct names), `"busiest"` (most rows; a tie goes to the alphabetically smallest name) and `"top_cell"` (the most common `(x, y)`; a tie goes to the smallest tuple). No records means `{"rows": 0, "animals": 0, "busiest": None, "top_cell": None}`.\n>\n> **`format_report(summary)` → str** — `rows=6 animals=3 busiest=fox top-cell=2,1`, or exactly `rows=0 animals=0 busiest=none top-cell=none` when there are no rows.\n>\n> **Prove it**: at least three `test_` functions, each with its own fixture, called at import. Then print the report for `station.log`. Output should be `rows=6 animals=3 busiest=fox top-cell=2,1`.',
          equals: 'rows=6 animals=3 busiest=fox top-cell=2,1',
          roFiles: ['station.log'],
          hidden: true,
          timeoutMs: 15000,
          hints: ladder(
            'Four jobs, in this order: parse one line, loop the file, summarise a list, format a dict. Write them as four separate functions and the tests almost write themselves.',
            'A one-line parser keeps `load_records` short: split on `,`, bail out unless there are three fields, then `int()` the last two inside a `try` and answer `None` on `ValueError`. In the loader, `line = raw.strip()`, `continue` on empty or `#`, and append to `records` or `rejects` depending on what the parser said.',
            'The tie rules are the same two-step you used on cells: `best = max(tally.values())`, then `min(key for key, seen in tally.items() if seen == best)`. For a test fixture, write your own tiny log with `Path("case_a.log").write_text("# day 1\\n\\nfox,1,1\\n")` and load that instead of the real one.',
            `"""The field station: load the log, report the day, prove it with tests."""

from collections import Counter
from pathlib import Path


def parse_row(line):
    """Return a record dict for a good row, or None for a bad one."""
    fields = line.split(",")
    if len(fields) != 3:
        return None
    animal, x, y = (field.strip() for field in fields)
    try:
        return {"animal": animal, "x": int(x), "y": int(y)}
    except ValueError:
        return None


def load_records(path="station.log"):
    """Read path and return (records, rejects). Blanks and # lines are skipped."""
    records = []
    rejects = []
    for raw in Path(path).read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        row = parse_row(line)
        if row is None:
            rejects.append(line)
        else:
            records.append(row)
    return records, rejects


def summarise(records):
    """Records in, one small dict out. Ties are documented, not accidental."""
    if not records:
        return {"rows": 0, "animals": 0, "busiest": None, "top_cell": None}
    animals = Counter(row["animal"] for row in records)
    cells = Counter((row["x"], row["y"]) for row in records)
    most_seen = max(animals.values())
    most_visited = max(cells.values())
    return {
        "rows": len(records),
        "animals": len(animals),
        "busiest": min(name for name, seen in animals.items() if seen == most_seen),
        "top_cell": min(cell for cell, seen in cells.items() if seen == most_visited),
    }


def format_report(summary):
    """One line a human reads and a test compares."""
    if not summary["rows"]:
        return "rows=0 animals=0 busiest=none top-cell=none"
    x, y = summary["top_cell"]
    return (
        f"rows={summary['rows']} animals={summary['animals']} "
        f"busiest={summary['busiest']} top-cell={x},{y}"
    )


def test_skips_blanks_and_comments():
    Path("case_a.log").write_text("# day 1\\n\\nfox,1,1\\n", encoding="utf-8")
    records, rejects = load_records("case_a.log")
    assert records == [{"animal": "fox", "x": 1, "y": 1}], records
    assert rejects == [], rejects


def test_keeps_a_bad_row_as_a_reject():
    Path("case_b.log").write_text("fox,1,1\\nbadger,oops,2\\nnope\\n", encoding="utf-8")
    records, rejects = load_records("case_b.log")
    assert len(records) == 1, records
    assert rejects == ["badger,oops,2", "nope"], rejects


def test_ties_follow_the_written_rule():
    rows = [{"animal": "owl", "x": 3, "y": 0}, {"animal": "fox", "x": 1, "y": 2}]
    summary = summarise(rows)
    assert summary["busiest"] == "fox", summary
    assert summary["top_cell"] == (1, 2), summary


def test_empty_log_still_reports():
    line = format_report(summarise([]))
    assert line == "rows=0 animals=0 busiest=none top-cell=none", line


test_skips_blanks_and_comments()
test_keeps_a_bad_row_as_a_reject()
test_ties_follow_the_written_rule()
test_empty_log_still_reports()

records, rejects = load_records()
print(format_report(summarise(records)))`
          )
        }),
        reflect(
          'ship-it',
          'Someone else now runs your tool on their own log. Which of your four tests would catch the first thing they break, and which rule of the brief has no test yet?'
        )
      ]
    }),
    files: {
      'main.py': `from pathlib import Path


def load_records(path="station.log"):
    lines = Path(path).read_text(encoding="utf-8").splitlines()
    return [{"animal": line, "x": 0, "y": 0} for line in lines], []


def summarise(records):
    return {"rows": len(records), "animals": 0, "busiest": None, "top_cell": None}


def format_report(summary):
    return "rows=" + str(summary["rows"])


def test_loads_the_fixture():
    load_records("station.log")


test_loads_the_fixture()
records, rejects = load_records()
print(format_report(summarise(records)))
`,
      'station.log': `# station log, day 12
fox,2,1
owl,0,3

fox,2,1
hare,4,4
fox,3,3
owl,1,0
badger,oops,2
`,
      'hidden_test.py': importAssert(`from pathlib import Path

records, rejects = main.load_records("station.log")
assert [row["animal"] for row in records] == ["fox", "owl", "fox", "hare", "fox", "owl"], records
assert records[0] == {"animal": "fox", "x": 2, "y": 1}, records[0]
assert all(isinstance(row["x"], int) and isinstance(row["y"], int) for row in records), "x and y are ints"
assert rejects == ["badger,oops,2"], rejects

Path("hidden_case.log").write_text("# day 1\\nfox,1,1\\n\\nowl,1,1\\nfox,0,0\\nbroken\\n", encoding="utf-8")
small, bad = main.load_records("hidden_case.log")
assert len(small) == 3, small
assert bad == ["broken"], bad

summary = main.summarise(small)
assert summary["rows"] == 3, summary
assert summary["animals"] == 2, summary
assert summary["busiest"] == "fox", summary
assert summary["top_cell"] == (1, 1), summary
assert main.format_report(summary) == "rows=3 animals=2 busiest=fox top-cell=1,1"

empty = main.summarise([])
assert empty == {"rows": 0, "animals": 0, "busiest": None, "top_cell": None}, empty
assert main.format_report(empty) == "rows=0 animals=0 busiest=none top-cell=none"

tie = main.summarise([{"animal": "owl", "x": 3, "y": 0}, {"animal": "fox", "x": 1, "y": 2}])
assert tie["busiest"] == "fox", "a tie on count breaks alphabetically"
assert tie["top_cell"] == (1, 2), "a tie on cells breaks to the smallest tuple"

tests = [name for name in dir(main) if name.startswith("test_") and callable(getattr(main, name))]
assert len(tests) >= 3, "the capstone ships at least three tests"
for name in tests:
    getattr(main, name)()

src = Path("main.py").read_text(encoding="utf-8")
assert src.count("assert ") >= 4, "tests need assertions, not just calls"`)
    }
  })

  return out
}
