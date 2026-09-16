import { lesson, teach, predict, check, cloze, tf, reflect, ladder, pyCode, importAssert } from './lib.mjs'

export function lessonsLanguage() {
  const out = []

  out.push({
    doc: lesson({
      id: 'objects-and-references',
      courseId: 'internals',
      moduleId: 'identity',
      title: 'A name points at an object',
      skillIds: ['python.types.names'],
      estimatedMinutes: 20,
      blocks: [
        teach({
          heading: 'Names point, they never contain',
          idea:
            'Every value you build lives somewhere in memory as an object, and a name is only a label pointing at it. Assignment never pours a value into a box; it moves a label onto an object that already exists. `id(value)` reports the identity of whatever object a name currently points at, so two labels stuck on one object always report the same number.',
          bites:
            'This bites when you assume two things that look alike are the same thing. `readings == backup` asks whether the contents match; `readings is backup` asks whether both names point at one object. The interpreter caches small integers and short strings, so `is` can look correct by accident on `x = 5` and then quietly give the wrong answer on the first list you try it on.',
          code: `north = [1, 2]
south = north            # one object, two labels
twin = [1, 2]            # a second object that happens to match

print(north is south)    # True  - the same object
print(north is twin)     # False - two objects
print(north == twin)     # True  - equal contents
print(id(north) == id(south))  # True - identity is what "is" reads`,
          mistake:
            'A common mistake is reaching for `is` when you meant `==`, then trusting the result because it happened to be right once. Keep `is` for `None`, `True`, `False`, and the rare moment you genuinely mean "the same object". The exercise asks you to report which of the three cases a pair of values is in, so the difference has to live in your code rather than in your head.'
        }),
        predict(
          'id-of-alias',
          '`north = [1, 2]` then `south = north`. What does `id(north) == id(south)` report?',
          [
            { id: 'true', md: '`True`' },
            { id: 'false', md: '`False` — assignment made a second list' }
          ],
          'true',
          {
            explainMd:
              'Assignment binds another label to the object that is already there; it never builds a second list. Both names point at one object, so both report the same identity number. Only something that constructs a new list — `list(north)`, `north[:]`, `copy.copy(north)` — gives you a second object with its own id.'
          }
        ),
        check(
          'separate-lists',
          'Two lists built separately from the same items: what do `==` and `is` say?',
          [
            { id: 'both-true', md: 'Both `True` — matching contents means one object', misconceptionId: 'is-means-equals' },
            { id: 'split', md: '`==` is `True`, `is` is `False`' },
            { id: 'both-false', md: 'Both `False`' }
          ],
          'split',
          {
            explainMd:
              '`==` walks the contents and finds them equal. `is` compares identity and finds two separate objects, so it is `False`. This is the single most useful distinction in this module: equality is about what a value holds, identity is about which object you are holding.'
          }
        ),
        cloze(
          'identity-words',
          '`==` compares {{a}}, and `is` compares {{b}}.',
          [
            { id: 'a', choices: ['contents', 'identity', 'memory size'] },
            { id: 'b', choices: ['identity', 'contents', 'type'] }
          ],
          { a: 'contents', b: 'identity' },
          {
            explainMd:
              'Read `a == b` as "do these hold the same thing" and `a is b` as "are these one object". A class can change what `==` means by defining `__eq__`, but nothing can change what `is` means — it is always the identity of the object, the same thing `id()` prints.'
          }
        ),
        pyCode({
          id: 'name-report',
          prompt:
            '> Write `report(a, b)` that returns `"same"` when both names point at one object, `"equal"` when the contents match but the objects differ, and `"different"` otherwise. Print `report([1, 2], [1, 2])`.',
          equals: 'equal',
          ast: ' is ',
          hidden: true,
          hints: ladder(
            'Three outcomes, and they have to be tested in the right order: identity is stricter than equality.',
            'Ask `a is b` first. If that is false, ask `a == b`. Anything that fails both is `"different"`.',
            'For `x = {"n": 1}`, `report(x, x)` is `"same"` while `report(x, {"n": 1})` is `"equal"` — one object versus two matching ones.',
            `def report(a, b):
    if a is b:
        return "same"
    if a == b:
        return "equal"
    return "different"


print(report([1, 2], [1, 2]))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def report(a, b):
    return "same"


print(report([1, 2], [1, 2]))
`,
      'hidden_test.py': importAssert(`shared = [1, 2]
assert main.report(shared, shared) == "same"
assert main.report([1, 2], [1, 2]) == "equal"
assert main.report([1, 2], [3]) == "different"
assert main.report(None, None) == "same"
assert main.report("north", 4) == "different"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'mutability-and-aliasing',
      courseId: 'internals',
      moduleId: 'identity',
      title: 'Some objects can be edited in place',
      skillIds: ['python.types.names', 'python.collections.list'],
      estimatedMinutes: 20,
      blocks: [
        teach({
          heading: 'Mutable objects change under every label',
          idea:
            'Lists, dicts, and sets are mutable: their contents can change while the object stays the same object. Numbers, strings, and tuples are immutable, so every "change" to one of them is really a new object bound to the old name. That single split explains most of the surprises in this course.',
          bites:
            'This bites at a function boundary. A parameter is just another label on the caller\'s object, so `log.append(value)` inside a function edits the list the caller is still holding. Rebinding the parameter with `log = log + [value]` does the opposite: it points the local label at a fresh list and the caller sees nothing at all.',
          code: `def add_reading(log, value):
    log.append(value)        # edits the caller's list

def rebind(log, value):
    log = log + [value]      # a new list; the caller never sees it

base = [4]
add_reading(base, 5)
rebind(base, 6)
print(base)                  # [4, 5]`,
          mistake:
            'A common mistake is writing a helper that looks like it returns a changed copy while it is really editing the argument — or the reverse. Decide which one you mean and make the signature say so: a mutator returns `None`, a builder returns the new object. The exercise asks you to write one of each and prove the caller\'s list only changes for the mutator.'
        }),
        predict(
          'passed-list-changes',
          '`base = [4]`, then a function whose body is `log.append(5)` is called with `base`. What is `base` afterwards?',
          [
            { id: 'grew', md: '`[4, 5]`' },
            { id: 'unchanged', md: '`[4]` — the function received a copy', misconceptionId: 'assignment-copies-a-list' }
          ],
          'grew',
          {
            explainMd:
              'Passing an argument binds the parameter name to the very same object; nothing is copied on the way in. `append` mutates that object, so the caller sees the extra item. If you want the caller protected, copy inside the function with `log = list(log)` or return `log + [value]` instead.'
          }
        ),
        tf(
          'tuple-immutable',
          'A tuple cannot be edited in place, so a function can never change a tuple its caller is holding.',
          true,
          {
            explainMd:
              'Tuples expose no method that mutates them, so the object a caller holds is safe. Careful, though: a tuple can *hold* a mutable object, and `point[0].append(1)` still edits that inner list. Immutability protects the container, not everything inside it.'
          }
        ),
        cloze(
          'mutate-vs-rebind',
          '`log.append(9)` {{a}} the object; `log = log + [9]` {{b}}.',
          [
            { id: 'a', choices: ['mutates', 'rebinds', 'copies'] },
            { id: 'b', choices: ['rebinds the local name', 'mutates the object', 'raises TypeError'] }
          ],
          { a: 'mutates', b: 'rebinds the local name' },
          {
            explainMd:
              'The first statement reaches through the label and edits the object every other label can see. The second builds a brand new list and moves only this one label onto it, which is why the caller notices the first and never the second. `log += [9]` is a third case: on a list it mutates in place.'
          }
        ),
        pyCode({
          id: 'mutate-or-build',
          prompt:
            '> Fix both helpers. `add_reading(log, value)` must append to the caller\'s own list and return nothing. `with_reading(log, value)` must return a new list and leave the caller\'s list untouched. Output should be `[4, 5] [4, 5, 6]`.',
          equals: '[4, 5] [4, 5, 6]',
          ast: '.append(',
          hidden: true,
          hints: ladder(
            'One helper is meant to change the caller\'s list, the other is meant to be harmless. Right now they are swapped.',
            'A mutator calls a method on the object (`log.append(value)`). A builder makes a new object and returns it (`return log + [value]`).',
            'For a dict the same pair looks like `data["k"] = 1` (mutates) versus `return {**data, "k": 1}` (builds).',
            `def add_reading(log, value):
    log.append(value)


def with_reading(log, value):
    return log + [value]


base = [4]
add_reading(base, 5)
fresh = with_reading(base, 6)
print(base, fresh)`
          )
        })
      ]
    }),
    files: {
      'main.py': `def add_reading(log, value):
    log = log + [value]


def with_reading(log, value):
    log.append(value)
    return log


base = [4]
add_reading(base, 5)
fresh = with_reading(base, 6)
print(base, fresh)
`,
      'hidden_test.py': importAssert(`first = [1]
assert main.add_reading(first, 2) is None, "add_reading should return nothing"
assert first == [1, 2], "add_reading must edit the caller's list"

second = [1]
grown = main.with_reading(second, 2)
assert grown == [1, 2]
assert second == [1], "with_reading must leave the caller's list alone"
assert grown is not second`)
    }
  })

  out.push({
    doc: lesson({
      id: 'copy-shallow-vs-deep',
      courseId: 'internals',
      moduleId: 'identity',
      title: 'A copy that is only one level deep',
      skillIds: ['python.collections.list'],
      estimatedMinutes: 20,
      blocks: [
        teach({
          heading: 'Shallow copies share what is inside',
          idea:
            '`copy.copy(data)` builds one new container and fills it with the *same* inner objects. The outer dict or list is genuinely separate, so adding a top-level key touches only the copy. Every nested list, dict, or set inside it is still shared, because a shallow copy never looks past the first level.',
          bites:
            'This bites on station records shaped like `{"grid": [[0, 0]], "name": "north"}`. You take a copy, edit `copy["grid"][0][0]`, and the original changes too — the two dicts are different objects pointing at one grid. `copy.deepcopy(data)` walks the whole structure and rebuilds every layer, so nothing is shared and the original is safe.',
          code: `import copy

base = {"grid": [[0]], "name": "north"}

near = copy.copy(base)
near["grid"][0].append(1)
print(base["grid"])          # [[0, 1]] - the grid was shared

base = {"grid": [[0]], "name": "north"}
far = copy.deepcopy(base)
far["grid"][0].append(1)
print(base["grid"])          # [[0]] - untouched`,
          mistake:
            'A common mistake is trusting `list(rows)`, `rows[:]`, or `dict(record)` to protect nested data. They are all shallow, and so is `copy.copy`. Reach for `deepcopy` when the structure has layers you intend to edit, and remember it is slower because it really does rebuild everything. The exercise asks you to hand back a twin that shares nothing.'
        }),
        predict(
          'shallow-nested-edit',
          '`near = copy.copy(base)` where `base = {"grid": [[0]]}`. After `near["grid"][0].append(1)`, what is `base["grid"]`?',
          [
            { id: 'shared', md: '`[[0, 1]]` — the inner list is shared' },
            { id: 'safe', md: '`[[0]]` — a copy protects everything inside it', misconceptionId: 'copy-is-always-deep' }
          ],
          'shared',
          {
            explainMd:
              'A shallow copy duplicates one level. `near` is a new dict, but its `"grid"` value is the same list object `base` points at, so appending through either name is visible through both. Only `copy.deepcopy` rebuilds the inner lists as separate objects.'
          }
        ),
        check(
          'which-are-shallow',
          'Which of these gives you a copy whose *nested* lists are independent?',
          [
            { id: 'slice', md: '`rows[:]`', misconceptionId: 'copy-is-always-deep' },
            { id: 'ctor', md: '`list(rows)`', misconceptionId: 'copy-is-always-deep' },
            { id: 'deep', md: '`copy.deepcopy(rows)`' }
          ],
          'deep',
          {
            explainMd:
              'Slicing, `list(...)`, `dict(...)`, and `copy.copy(...)` are all one level deep: new container, same inner objects. `copy.deepcopy` recurses through the whole structure and rebuilds each layer, which is exactly why it costs more and why you only ask for it when you mean it.'
          }
        ),
        tf(
          'deepcopy-top-level',
          'A deep copy is also a new object at the top level, so `deepcopy(base) is base` is `False`.',
          true,
          {
            explainMd:
              'Deep means "and everything below", not "instead of the top". `deepcopy` returns a new outer container whose members are new too, so both `is base` and `is base["grid"]` are `False`. Equality still holds: the twin compares `==` to the original until you change one of them.'
          }
        ),
        pyCode({
          id: 'deep-twin',
          prompt:
            '> Write `deep_twin(data)` so the returned dictionary shares nothing with the original — the nested list must be its own object too. Output should be `[[0]] [[0, 1]]`.',
          equals: '[[0]] [[0, 1]]',
          ast: 'deepcopy',
          hidden: true,
          hints: ladder(
            'The starter already copies, but only the outer dict. Look at what the two dicts still have in common.',
            'The `copy` module has two functions. `copy.copy` stops at one level; `copy.deepcopy` rebuilds every layer it finds.',
            '`copy.deepcopy([[1], [2]])` gives a new outer list whose two inner lists are also new, so appending to one of them leaves the original alone.',
            `import copy


def deep_twin(data):
    return copy.deepcopy(data)


base = {"grid": [[0]], "name": "north"}
twin = deep_twin(base)
twin["grid"][0].append(1)
print(base["grid"], twin["grid"])`
          )
        })
      ]
    }),
    files: {
      'main.py': `import copy


def deep_twin(data):
    return copy.copy(data)


base = {"grid": [[0]], "name": "north"}
twin = deep_twin(base)
twin["grid"][0].append(1)
print(base["grid"], twin["grid"])
`,
      'hidden_test.py': importAssert(`record = {"grid": [[1], [2]], "name": "north"}
twin = main.deep_twin(record)
assert twin == record, "the twin should start out equal"
assert twin is not record
assert twin["grid"] is not record["grid"], "the nested list must be a new object"
assert twin["grid"][0] is not record["grid"][0]
twin["grid"][0].append(9)
assert record["grid"][0] == [1], "the original must not change"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'iterables-and-iterators',
      courseId: 'internals',
      moduleId: 'iteration',
      title: 'What a for loop actually does',
      skillIds: ['python.internals.iteration'],
      estimatedMinutes: 22,
      blocks: [
        teach({
          heading: 'Two words: iterable and iterator',
          idea:
            'An **iterable** is anything that can hand out an iterator when you call `iter()` on it. An **iterator** is the thing that actually walks: it answers `__next__()` with the next item and raises `StopIteration` when it has nothing left. A list is an iterable and can produce many independent iterators; an iterator is usually its own iterable, so `iter(it) is it`.',
          bites:
            'This matters because `for` is not magic. Python calls `iter()` on your object once, then calls `__next__()` over and over inside an invisible `try`, and stops the moment `StopIteration` arrives. Every laziness feature later in this course — generators, `itertools`, file objects — is just an object that implements those two methods.',
          code: `route = iter(["north", "east"])   # a list iterator

while True:
    try:
        cell = next(route)
    except StopIteration:
        break
    print(cell)

# the for loop above, written out longhand`,
          mistake:
            'A common mistake is returning something other than `self` from `__iter__`, or forgetting to raise `StopIteration` at the end — the first breaks `for x in obj`, the second loops forever. The exercise asks you to finish an iterator class, so both methods have to be right before a plain `list(...)` around it can work.'
        }),
        predict(
          'for-calls-what',
          'What does `for cell in route:` call on `route` before the first item arrives?',
          [
            { id: 'iter', md: '`iter(route)`' },
            { id: 'len', md: '`len(route)`' },
            { id: 'next', md: '`next(route)` straight away' }
          ],
          'iter',
          {
            explainMd:
              '`for` starts by asking the object for an iterator with `iter()`, then calls `next()` on that iterator repeatedly. It never needs `len`, which is why a `for` loop happily walks a file or a generator whose length nobody knows in advance.'
          }
        ),
        check(
          'stop-iteration-role',
          'How does a `for` loop know when to stop?',
          [
            { id: 'stop', md: 'The iterator raises `StopIteration` and the loop catches it' },
            { id: 'none', md: 'The iterator returns `None`' },
            { id: 'length', md: 'The loop compares a counter with `len()`' }
          ],
          'stop',
          {
            explainMd:
              '`StopIteration` is the end-of-stream signal, and the `for` statement catches it for you — which is why you never write that `except` yourself. Returning `None` would not end anything: `None` is a perfectly good item, and the loop would take it and ask for the next one.'
          }
        ),
        cloze(
          'iter-words',
          'Calling `iter()` on a list gives you an {{a}}; calling `iter()` on that result gives you {{b}}.',
          [
            { id: 'a', choices: ['iterator', 'iterable', 'copy of the list'] },
            { id: 'b', choices: ['the same object back', 'a fresh iterator', 'None'] }
          ],
          { a: 'iterator', b: 'the same object back' },
          {
            explainMd:
              'An iterator is required to return itself from `__iter__`, so `iter(it) is it` holds. That convention is what lets you drop a half-consumed iterator straight into a `for` loop and pick up where you left off instead of starting over.'
          }
        ),
        pyCode({
          id: 'route-iterator',
          prompt:
            '> Finish `Route` so it is its own iterator: `__iter__` hands back the object itself and `__next__` returns the next cell, raising `StopIteration` once the route runs out. Print `list(Route([1, 2, 3]))`.',
          equals: '[1, 2, 3]',
          ast: 'StopIteration',
          hidden: true,
          hints: ladder(
            '`__next__` currently gives up immediately, so `list(...)` sees an empty stream.',
            'Keep a position on the instance. If it has reached the end, raise `StopIteration`; otherwise read the cell there, move the position on by one, and return the cell.',
            'A countdown iterator does the same thing in reverse: store `self.left`, raise when it hits zero, else decrement and return it.',
            `class Route:
    def __init__(self, cells):
        self.cells = cells
        self.pos = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.pos >= len(self.cells):
            raise StopIteration
        cell = self.cells[self.pos]
        self.pos += 1
        return cell


print(list(Route([1, 2, 3])))`
          )
        })
      ]
    }),
    files: {
      'main.py': `class Route:
    def __init__(self, cells):
        self.cells = cells
        self.pos = 0

    def __iter__(self):
        return self

    def __next__(self):
        raise StopIteration


print(list(Route([1, 2, 3])))
`,
      'hidden_test.py': importAssert(`route = main.Route(["a", "b"])
assert iter(route) is route, "__iter__ should return the iterator itself"
assert next(route) == "a"
assert next(route) == "b"
try:
    next(route)
except StopIteration:
    pass
else:
    raise AssertionError("expected StopIteration once the route is spent")

assert list(main.Route([])) == []
assert [cell for cell in main.Route([1, 2])] == [1, 2]`)
    }
  })

  out.push({
    doc: lesson({
      id: 'generators-yield',
      courseId: 'internals',
      moduleId: 'iteration',
      title: 'yield makes a stream, not a list',
      skillIds: ['python.internals.iteration'],
      estimatedMinutes: 22,
      blocks: [
        teach({
          heading: 'A function that pauses',
          idea:
            'A function containing `yield` is a generator function. Calling it runs none of the body: it hands back a generator object. Each `next()` runs the body until the next `yield`, gives you that value, and freezes the function — locals, position in the loop and all — until you ask again.',
          bites:
            'This bites the first time you treat the result like a list. A generator has no length, no index, and no memory of what it already gave you, so `stream[0]`, `len(stream)`, and a second `for` over it all fail or come back empty. In exchange it never holds more than one item at a time, which is the whole point when the station log has a million lines.',
          code: `def station_ids(count):
    for number in range(1, count + 1):
        yield f"S{number}"

stream = station_ids(3)
print(next(stream))        # S1  - the body ran up to the first yield
print(list(stream))        # ['S2', 'S3'] - carries on from there
print(list(stream))        # [] - nothing is replayed`,
          mistake:
            'A common mistake is building a list inside the function and returning it, which quietly throws away the laziness even though the printed output looks identical. If you truly need to walk the items twice, wrap the call in `list(...)` at the call site and pay for the memory on purpose. The exercise asks for a generator, and the hidden test checks the function itself, not just what it prints.'
        }),
        predict(
          'second-loop',
          'You loop over a generator, then loop over the same generator object again. The second loop sees…',
          [
            { id: 'again', md: 'The same items a second time', misconceptionId: 'generator-is-a-list' },
            { id: 'nothing', md: 'Nothing — it is exhausted' }
          ],
          'nothing',
          {
            explainMd:
              'A generator produces each item once and keeps no history, so a spent generator is an empty stream forever. Call the generator function again for a fresh one, or materialise it with `list(...)` when you know you need more than one pass over the data.'
          }
        ),
        check(
          'call-runs-nothing',
          'What happens the instant you call a generator function?',
          [
            { id: 'nothing', md: 'Nothing in the body runs; you get a generator object' },
            { id: 'all', md: 'The whole body runs and the yields are collected', misconceptionId: 'generator-is-a-list' },
            { id: 'first', md: 'The body runs up to the first `yield`' }
          ],
          'nothing',
          {
            explainMd:
              'The call only builds the generator. Not one line of the body executes until the first `next()` — which is why a `print` on the first line of a generator function stays silent until something consumes the stream. That first `next()` is what runs the body up to the first `yield`.'
          }
        ),
        tf(
          'generator-len',
          '`len(station_ids(3))` works because the generator knows it will produce three items.',
          false,
          {
            explainMd:
              'It raises `TypeError`. A generator has no length: it only knows how to produce the next item, and in general it cannot know how many are left — some generators are endless. Wrap it in `list(...)` first if you really need a count.'
          }
        ),
        pyCode({
          id: 'ids-as-stream',
          prompt:
            '> Rewrite `station_ids(count)` as a generator: it must `yield` `"S1"`, `"S2"`, … one at a time instead of collecting them. Print `list(station_ids(3))`.',
          equals: "['S1', 'S2', 'S3']",
          ast: 'yield',
          hidden: true,
          hints: ladder(
            'The printed output is already right — the shape of the function is what is wrong.',
            'Delete the list and the `return`. Inside the loop, `yield` each id as you make it; the function becomes a generator function by containing that keyword.',
            'A countdown reads the same way: `for n in range(3, 0, -1): yield n` produces 3, 2, 1 without ever holding all three.',
            `def station_ids(count):
    for number in range(1, count + 1):
        yield f"S{number}"


print(list(station_ids(3)))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def station_ids(count):
    ids = []
    for number in range(1, count + 1):
        ids.append(f"S{number}")
    return ids


print(list(station_ids(3)))
`,
      'hidden_test.py': importAssert(`import inspect

assert inspect.isgeneratorfunction(main.station_ids), "station_ids should be a generator function"

stream = main.station_ids(3)
assert not isinstance(stream, list), "calling it must not build a list"
assert next(stream) == "S1"
assert list(stream) == ["S2", "S3"]
assert list(stream) == [], "a spent generator yields nothing the second time"
assert list(main.station_ids(0)) == []`)
    }
  })

  out.push({
    doc: lesson({
      id: 'generator-pipelines',
      courseId: 'internals',
      moduleId: 'iteration',
      title: 'A pipeline that never holds the log',
      skillIds: ['python.internals.iteration'],
      estimatedMinutes: 24,
      blocks: [
        teach({
          heading: 'Each stage pulls one item',
          idea:
            'Generators compose. When you write `temps(cleaned(noisy(1000)))` nothing has been read yet; you have built a chain of three paused functions. Asking the last stage for one item pulls one item through every stage, so peak memory is one line rather than a million.',
          bites:
            'This bites in reverse if any stage builds a list. One `[line.strip() for line in lines]` in the middle forces the whole log into memory and undoes the laziness of everything upstream. A generator expression — the same comprehension in round brackets — keeps the chain lazy and reads almost the same.',
          code: `def noisy(count):
    for number in range(count):
        yield f"  temp={number}  "

def cleaned(lines):
    for line in lines:
        yield line.strip()

stripped = cleaned(noisy(3))
print(next(stripped))                       # temp=0

# the same stage as a generator expression
lazy = (line.strip() for line in noisy(3))
print(sum(1 for _ in lazy))                 # 3, one line at a time`,
          mistake:
            'A common mistake is testing a pipeline with `list(...)` around every stage, which hides the fact that one stage is eager. Check the *function*, not the output: `inspect.isgeneratorfunction` tells you whether a stage still streams. The exercise asks you to turn two stub stages into generators and pipe a thousand lines through them.'
        }),
        predict(
          'pipeline-work-done',
          '`stream = temps(cleaned(noisy(1000)))` — how many lines have been read when that line finishes?',
          [
            { id: 'none', md: 'None; only the chain has been built' },
            { id: 'all', md: 'All thousand, once per stage' },
            { id: 'one', md: 'Exactly one, to prime the pipeline' }
          ],
          'none',
          {
            explainMd:
              'Building the chain runs no bodies at all — each call just makes a paused generator. The first `next()` or `sum()` at the end of the chain is what pulls a line through `noisy`, then `cleaned`, then `temps`. Nothing upstream runs ahead of demand.'
          }
        ),
        check(
          'eager-stage',
          'One stage in the middle does `return [line.strip() for line in lines]`. What does that cost?',
          [
            { id: 'nothing', md: 'Nothing — the output is identical' },
            { id: 'memory', md: 'The whole log is materialised there, so the pipeline is no longer lazy' },
            { id: 'crash', md: 'A `TypeError`, because a list cannot feed a generator' }
          ],
          'memory',
          {
            explainMd:
              'The output stays the same, which is exactly what makes this hard to spot. But that stage has to finish before it returns, so it drains everything upstream into one list, and peak memory becomes the whole log. Swap the square brackets for a `yield` loop or round brackets and the chain streams again.'
          }
        ),
        cloze(
          'genexp-words',
          '`[x for x in rows]` builds a {{a}}; `(x for x in rows)` builds a {{b}}.',
          [
            { id: 'a', choices: ['list', 'generator', 'tuple'] },
            { id: 'b', choices: ['generator', 'tuple', 'set'] }
          ],
          { a: 'list', b: 'generator' },
          {
            explainMd:
              'Square brackets do the work now and hand back a full list; round brackets hand back a generator that does the work on demand. Round brackets are also implied inside a single-argument call, which is why `sum(int(x) for x in rows)` needs no extra pair of brackets.'
          }
        ),
        pyCode({
          id: 'log-pipeline',
          prompt:
            '> Make `cleaned` and `temps` generators and let the pipeline run. `cleaned(lines)` yields each line stripped of spaces; `temps(rows)` yields the integer from every row that starts with `temp=`. Output should be `249500`.',
          equals: '249500',
          hidden: true,
          hints: ladder(
            'The two stages return empty lists, so the sum at the bottom has nothing to add. Do not change `noisy`.',
            'Each stage is a `for` loop over its input that `yield`s what it wants to pass on — and simply skips a row it does not want, with no `else` needed.',
            'A filter stage reads like this: `for row in rows:` / `if row.startswith("wind="): yield row`. Nothing is collected; each wanted row is handed straight on.',
            `def noisy(count):
    """Pretend this log is far too big to hold in memory."""
    for number in range(count):
        yield f"  temp={number}  " if number % 2 == 0 else "  skip  "


def cleaned(lines):
    for line in lines:
        yield line.strip()


def temps(rows):
    for row in rows:
        if row.startswith("temp="):
            yield int(row.split("=")[1])


print(sum(temps(cleaned(noisy(1000)))))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def noisy(count):
    """Pretend this log is far too big to hold in memory."""
    for number in range(count):
        yield f"  temp={number}  " if number % 2 == 0 else "  skip  "


def cleaned(lines):
    return []


def temps(rows):
    return []


print(sum(temps(cleaned(noisy(1000)))))
`,
      'hidden_test.py': importAssert(`import inspect

assert inspect.isgeneratorfunction(main.cleaned), "cleaned should yield, not build a list"
assert inspect.isgeneratorfunction(main.temps), "temps should yield, not build a list"

assert list(main.cleaned(["  a  ", " b "])) == ["a", "b"]
assert list(main.temps(["temp=5", "skip", "temp=7"])) == [5, 7]

stream = main.temps(main.cleaned(main.noisy(4)))
assert next(stream) == 0
assert sum(stream) == 2`)
    }
  })

  out.push({
    doc: lesson({
      id: 'itertools-basics',
      courseId: 'internals',
      moduleId: 'iteration',
      title: 'itertools: slice, chain, group',
      skillIds: ['python.internals.iteration'],
      estimatedMinutes: 24,
      blocks: [
        teach({
          heading: 'Lazy tools that already exist',
          idea:
            '`itertools` is a small library of iterators you would otherwise hand-roll. `count()` produces numbers forever, `islice(stream, n)` takes the first `n` items of anything, `chain(a, b)` walks several streams as if they were one, and `groupby(rows, key=...)` collapses *runs* of equal keys into groups.',
          bites:
            '`groupby` is the trap. It only compares each row with the one before it, so it starts a new group every time the key changes — on unsorted input you get `temp`, `wind`, `temp` as three separate groups. Sort by the same key first and each key appears in exactly one run. The group it hands you is also a lazy iterator that dies as soon as you move to the next group.',
          code: `from itertools import chain, count, groupby, islice
from operator import itemgetter

print(list(islice(count(), 3)))                      # [0, 1, 2] from an endless stream
print(list(chain(["a"], ["b", "c"])))                # ['a', 'b', 'c']

rows = [("temp", 3), ("wind", 9), ("temp", 5)]
for kind, group in groupby(sorted(rows, key=itemgetter(0)), key=itemgetter(0)):
    print(kind, [value for _, value in group])       # temp [3, 5] / wind [9]`,
          mistake:
            'A common mistake is calling `islice` on a list you already built — the saving comes from slicing something you never materialised, like `count()` or a file. The other is keeping a `groupby` group to look at later, when it has already been consumed. The exercise asks for all three tools, so read the group into a list while you hold it.'
        }),
        predict(
          'groupby-unsorted',
          '`groupby` over `[("temp", 3), ("wind", 9), ("temp", 5)]` keyed on the name yields how many groups?',
          [
            { id: 'two', md: 'Two — one per distinct name' },
            { id: 'three', md: 'Three — `temp`, `wind`, then `temp` again' }
          ],
          'three',
          {
            explainMd:
              '`groupby` groups *adjacent* equal keys, so a key that reappears later starts a second group. Sorting by the same key first is what turns "runs" into "one group per key". This is the single most common `groupby` bug and it never raises — it just quietly returns the wrong shape.'
          }
        ),
        check(
          'islice-on-count',
          'Why is `islice(count(), 3)` safe even though `count()` is endless?',
          [
            { id: 'lazy', md: '`islice` pulls only the items it needs and then stops asking' },
            { id: 'materialise', md: '`count()` stops at 3 once `islice` tells it the limit' },
            { id: 'copy', md: '`islice` copies the stream first, then trims it' }
          ],
          'lazy',
          {
            explainMd:
              'Everything here is pull-based: `islice` asks `count()` for a next value three times and then reports that it is done, so the endless source is simply never asked again. That is why `list(count())` hangs while `list(islice(count(), 3))` returns instantly.'
          }
        ),
        cloze(
          'itertools-words',
          '`chain(a, b)` returns {{a}}, so `list(...)` around it is {{b}}.',
          [
            { id: 'a', choices: ['a lazy iterator', 'a new list', 'a tuple'] },
            { id: 'b', choices: ['how you materialise it', 'forbidden', 'automatic'] }
          ],
          { a: 'a lazy iterator', b: 'how you materialise it' },
          {
            explainMd:
              '`chain` never copies its inputs; it walks the first to exhaustion, then the next. Printing it shows `<itertools.chain object ...>`, so wrap it in `list(...)` when you want to see or index the result — and leave it lazy when you are only going to loop once.'
          }
        ),
        pyCode({
          id: 'itertools-three',
          prompt:
            '> Fill in three helpers with `itertools`. `labels(n)` returns the first `n` ids (`"S0"`, `"S1"`, …) taken from an endless `count()`. `merged(a, b)` chains two logs lazily without copying them. `by_kind(rows)` groups rows into `{kind: [values]}` — sort before you group. Output should be `{\'temp\': [3, 5, 4], \'wind\': [9, 1]}`.',
          equals: "{'temp': [3, 5, 4], 'wind': [9, 1]}",
          hidden: true,
          hints: ladder(
            'Three small bodies. The imports you need are already at the top of the file.',
            '`islice(count(), n)` gives the first `n` numbers; `chain(a, b)` returns the joined iterator directly; `groupby` needs `sorted(rows, key=...)` with the *same* key it groups on.',
            'A grouped dict is built like this: `for key, group in groupby(sorted(pairs, key=itemgetter(0)), key=itemgetter(0)): out[key] = [v for _, v in group]`.',
            `from itertools import chain, count, groupby, islice
from operator import itemgetter

ROWS = [("temp", 3), ("wind", 9), ("temp", 5), ("wind", 1), ("temp", 4)]


def labels(n):
    return [f"S{number}" for number in islice(count(), n)]


def merged(a, b):
    return chain(a, b)


def by_kind(rows):
    grouped = {}
    for kind, group in groupby(sorted(rows, key=itemgetter(0)), key=itemgetter(0)):
        grouped[kind] = [value for _, value in group]
    return grouped


print(by_kind(ROWS))`
          )
        })
      ]
    }),
    files: {
      'main.py': `from itertools import chain, count, groupby, islice
from operator import itemgetter

ROWS = [("temp", 3), ("wind", 9), ("temp", 5), ("wind", 1), ("temp", 4)]


def labels(n):
    return []


def merged(a, b):
    return a


def by_kind(rows):
    return {}


print(by_kind(ROWS))
`,
      'hidden_test.py': importAssert(`from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
for tool in ("islice", "chain", "groupby"):
    assert tool in src, "expected your code to use " + tool

assert main.labels(3) == ["S0", "S1", "S2"]
assert main.labels(0) == []
assert list(main.merged([1, 2], [3])) == [1, 2, 3]
assert not isinstance(main.merged([1], [2]), list), "chain should stay lazy"
assert main.by_kind([("b", 1), ("a", 2), ("b", 3)]) == {"a": [2], "b": [1, 3]}
assert main.by_kind([]) == {}`)
    }
  })

  out.push({
    doc: lesson({
      id: 'decorators-basics',
      courseId: 'internals',
      moduleId: 'wrap',
      title: 'A decorator wraps, it does not rewrite',
      skillIds: ['python.internals.decorators'],
      estimatedMinutes: 24,
      blocks: [
        teach({
          heading: 'Take a function, return a function',
          idea:
            'A decorator is an ordinary function that takes a function and returns a replacement. `@traced` above `def scan(...)` is pure shorthand: Python defines `scan`, calls `traced(scan)`, and rebinds the name `scan` to whatever came back. Nothing about the original body changes — it is still there, now reachable only through the wrapper that closed over it.',
          bites:
            'This bites when the wrapper is careless. `def wrapper(cell)` breaks every other signature, so wrappers take `*args, **kwargs` and pass them straight through. And because the name now points at `wrapper`, `scan.__name__` reports `"wrapper"` and the docstring disappears — until you put `@wraps(func)` on the wrapper and let `functools` copy that metadata across.',
          code: `from functools import wraps

def traced(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@traced
def scan(cell):
    return f"scanned {cell}"

# identical to: scan = traced(scan)
print(scan("north"), scan.__name__)`,
          mistake:
            'A common mistake is thinking the decorator edits the source of the function it decorates. It cannot see the source at all; it only receives the finished function object and decides what to call and when. The exercise asks you to record every call in a list and hand the real result back untouched, with the wrapped name preserved.'
        }),
        predict(
          'what-at-does',
          'What does `@traced` above `def scan(...)` actually do?',
          [
            { id: 'rewrite', md: 'Edits the body of `scan` before it runs', misconceptionId: 'decorator-edits-the-source' },
            { id: 'rebind', md: 'Rebinds the name `scan` to `traced(scan)`' }
          ],
          'rebind',
          {
            explainMd:
              'The `@` line is shorthand for one assignment: `scan = traced(scan)`, run right after the `def`. The original function object is untouched — the decorator just happens to be the only thing still holding a reference to it, which is how the wrapper can call it later.'
          }
        ),
        check(
          'why-wraps',
          'Without `functools.wraps`, what does `scan.__name__` report after decoration?',
          [
            { id: 'scan', md: '`"scan"` — the name in the `def` wins' },
            { id: 'wrapper', md: '`"wrapper"` — the name now points at the inner function' },
            { id: 'traced', md: '`"traced"`' }
          ],
          'wrapper',
          {
            explainMd:
              'The name `scan` points at the wrapper, so its metadata is the wrapper\'s: `__name__`, `__doc__`, and the signature tooling reads. `@wraps(func)` copies those across from the original and also records it as `__wrapped__`, which keeps tracebacks, help text, and test output honest.'
          }
        ),
        tf(
          'wrapper-args',
          'A wrapper written as `def wrapper(*args, **kwargs)` works for functions with any signature.',
          true,
          {
            explainMd:
              'Collecting `*args, **kwargs` and forwarding them unchanged means the wrapper does not need to know or care what it wraps. Hard-coding `def wrapper(cell)` would work for one function and raise `TypeError` on the next one you decorate.'
          }
        ),
        pyCode({
          id: 'traced-decorator',
          prompt:
            '> Write `traced` so it returns a wrapper that appends the wrapped function\'s name to `CALLS` and then hands back whatever the original returned. Keep the wrapped name intact with `functools.wraps`. Output should be `scanned north scan 1`.',
          equals: 'scanned north scan 1',
          ast: '@wraps',
          hidden: true,
          hints: ladder(
            'Right now `traced` hands the function straight back, so nothing is recorded and `CALLS` stays empty.',
            'Define a `wrapper(*args, **kwargs)` inside `traced`: record the call, then `return func(*args, **kwargs)`. Return the wrapper, not the result of calling it.',
            'A timing decorator has the same shape: note something before the call, `result = func(*args, **kwargs)`, note something after, `return result`.',
            `from functools import wraps

CALLS = []


def traced(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        CALLS.append(func.__name__)
        return func(*args, **kwargs)

    return wrapper


@traced
def scan(cell):
    return f"scanned {cell}"


print(scan("north"), scan.__name__, len(CALLS))`
          )
        })
      ]
    }),
    files: {
      'main.py': `from functools import wraps

CALLS = []


def traced(func):
    return func


@traced
def scan(cell):
    return f"scanned {cell}"


print(scan("north"), scan.__name__, len(CALLS))
`,
      'hidden_test.py': importAssert(`assert main.scan.__name__ == "scan", "functools.wraps should keep the original name"
assert hasattr(main.scan, "__wrapped__"), "scan should be a wrapper around the original function"

before = len(main.CALLS)
assert main.scan("east") == "scanned east", "the wrapper must return the real result"
assert main.CALLS[before:] == ["scan"], "every call should be recorded once"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'decorators-with-args',
      courseId: 'internals',
      moduleId: 'wrap',
      title: 'One more layer for an argument',
      skillIds: ['python.internals.decorators'],
      estimatedMinutes: 22,
      blocks: [
        teach({
          heading: 'Three functions deep, and why',
          idea:
            'A plain decorator receives a function. A decorator with arguments receives the *arguments*, so it has to hand back a decorator, which then hands back the wrapper. `@tagged("north")` calls `tagged("north")` first; the thing it returns is what actually gets called with your function.',
          bites:
            'This bites when you write only two layers. `@tagged("north")` on a two-layer decorator passes the string where the function was expected, and you get a `TypeError` about a string not being callable — or worse, silence and a broken function. Count the layers against the call: the outer takes the tag, the middle takes the function, the inner takes the call arguments.',
          code: `from functools import wraps

def tagged(tag):
    def decorate(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return f"[{tag}] {func(*args, **kwargs)}"
        return wrapper
    return decorate

@tagged("north")
def report(count):
    return f"{count} tracks"

# identical to: report = tagged("north")(report)
print(report(2))`,
          mistake:
            'A common mistake is forgetting the brackets: `@tagged` without them passes your function in as `tag` and the wrapper never appears. The tag itself lives in the closure, so each decorated function keeps its own. The exercise asks you to add the missing layer and prefix the result.'
        }),
        predict(
          'layers-order',
          '`@tagged("north")` above `def report(...)` — what is called first?',
          [
            { id: 'tag-first', md: '`tagged("north")`, and its result is then called with `report`' },
            { id: 'func-first', md: '`tagged(report)`, and `"north"` is passed later' }
          ],
          'tag-first',
          {
            explainMd:
              'The expression after `@` is evaluated first, exactly as written, and only then is the result applied to the function below. So `@tagged("north")` is `report = tagged("north")(report)` — two calls, which is why a parameterised decorator needs one more layer than a plain one.'
          }
        ),
        check(
          'missing-layer',
          'A two-layer `tagged(tag)` that returns the wrapper directly, used as `@tagged("north")`, gives you…',
          [
            { id: 'works', md: 'The same behaviour; the layer is optional' },
            { id: 'breaks', md: 'A broken `report`, because the wrapper is handed the tag instead of the function' }
          ],
          'breaks',
          {
            explainMd:
              'With one layer missing, `tagged("north")` returns the wrapper, and Python then calls that wrapper with `report` as its argument — so `report` becomes whatever the wrapper returned, and the original function is never called properly. The fix is a middle layer whose only job is to receive the function.'
          }
        ),
        cloze(
          'layer-words',
          'The outer function receives the {{a}}; the middle function receives the {{b}}.',
          [
            { id: 'a', choices: ['decorator argument', 'function', 'call arguments'] },
            { id: 'b', choices: ['function', 'decorator argument', 'return value'] }
          ],
          { a: 'decorator argument', b: 'function' },
          {
            explainMd:
              'Outer takes the tag, middle takes the function, inner takes whatever the caller passes at call time. Each layer closes over the one above it, which is how the wrapper can still see `tag` long after `tagged` has returned.'
          }
        ),
        pyCode({
          id: 'tagged-decorator',
          prompt:
            '> Finish `tagged(tag)` so the decorated function\'s result comes back prefixed with `[tag] `. Keep the wrapped name with `functools.wraps`. Output should be `[north] 2 tracks`.',
          equals: '[north] 2 tracks',
          ast: 'return wrapper',
          hidden: true,
          hints: ladder(
            '`decorate` currently hands the function straight back, so the tag is never used.',
            'Inside `decorate`, define `wrapper(*args, **kwargs)` that calls `func(*args, **kwargs)` and returns the result with the tag in front. Return `wrapper` from `decorate`.',
            'A repeat decorator nests the same way: `def repeat(times)` → `def decorate(func)` → `def wrapper(*a, **k)` that loops `times` and returns the last result.',
            `from functools import wraps


def tagged(tag):
    def decorate(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return f"[{tag}] {func(*args, **kwargs)}"

        return wrapper

    return decorate


@tagged("north")
def report(count):
    return f"{count} tracks"


print(report(2))`
          )
        })
      ]
    }),
    files: {
      'main.py': `from functools import wraps


def tagged(tag):
    def decorate(func):
        return func

    return decorate


@tagged("north")
def report(count):
    return f"{count} tracks"


print(report(2))
`,
      'hidden_test.py': importAssert(`assert main.report(0) == "[north] 0 tracks"
assert main.report.__name__ == "report", "keep the wrapped name with functools.wraps"

decorate = main.tagged("dawn")
assert callable(decorate), "tagged(tag) must return a decorator"


@decorate
def note():
    return "clear"


assert note() == "[dawn] clear", "each tag lives in its own closure"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'context-managers',
      courseId: 'internals',
      moduleId: 'wrap',
      title: 'with: cleanup that always happens',
      skillIds: ['python.internals.context'],
      estimatedMinutes: 24,
      blocks: [
        teach({
          heading: 'Two methods and a guarantee',
          idea:
            '`with obj as name:` calls `obj.__enter__()` and binds whatever it returns to `name`. When the block ends — normally, by `return`, or because something raised — Python calls `obj.__exit__(exc_type, exc, tb)`. That second call is the guarantee: it is the reason `with open(...)` cannot leak a file handle.',
          bites:
            '`contextlib.contextmanager` turns a generator into the same protocol: everything before `yield` is the setup, the `yield` is where the block runs, and everything after is the teardown. That is exactly where people get burned — if the block raises, the exception is thrown *into* the generator at the `yield`, so any cleanup that is not inside a `finally` is skipped.',
          code: `from contextlib import contextmanager

@contextmanager
def shift(name):
    print("start", name)
    try:
        yield name
    finally:
        print("stop", name)      # runs even when the block raises

try:
    with shift("dawn"):
        raise ValueError("storm")
except ValueError:
    print("handled")`,
          mistake:
            'A common mistake is returning a truthy value from `__exit__`, which silently swallows the exception; return `False` (or nothing) unless suppressing it is genuinely the point. The exercise asks for both forms — a class and a `@contextmanager` — and the recorded order proves your teardown survived the error.'
        }),
        predict(
          'exit-on-raise',
          'The block inside a `with` raises. Does `__exit__` run?',
          [
            { id: 'yes', md: 'Yes — then the exception carries on unless `__exit__` suppresses it' },
            { id: 'no', md: 'No — the exception skips the rest of the statement' }
          ],
          'yes',
          {
            explainMd:
              '`__exit__` is called on every exit path, and it is handed the exception type, value, and traceback so it can decide what to do. Return `False` and the exception continues on its way; return `True` and you have swallowed it, which is almost never what you want.'
          }
        ),
        check(
          'contextmanager-cleanup',
          'In a `@contextmanager` generator, where does teardown have to live to survive an exception in the block?',
          [
            { id: 'after', md: 'On the line after `yield`' },
            { id: 'finally', md: 'In a `finally` around the `yield`' },
            { id: 'exit', md: 'In an `__exit__` method as well' }
          ],
          'finally',
          {
            explainMd:
              'The exception is thrown into the generator at the `yield`, so plain code after the `yield` is never reached. Wrapping the `yield` in `try` / `finally` is what makes the teardown unconditional — the same guarantee the class form gets from `__exit__` for free.'
          }
        ),
        cloze(
          'with-words',
          '`with obj as name:` binds `name` to the return value of {{a}}, and calls {{b}} on the way out.',
          [
            { id: 'a', choices: ['__enter__', '__init__', '__exit__'] },
            { id: 'b', choices: ['__exit__', '__del__', 'close'] }
          ],
          { a: '__enter__', b: '__exit__' },
          {
            explainMd:
              '`__init__` builds the object, `__enter__` starts the managed period and decides what `as` sees, `__exit__` ends it. Many managers simply `return self` from `__enter__`; a file object returns itself too, which is why `with open(p) as f` hands you the file.'
          }
        ),
        pyCode({
          id: 'both-managers',
          prompt:
            '> Finish both. `Station` records `"open"` in `__enter__`, hands itself back, and records `"close"` in `__exit__` without swallowing the error. `shift` records `"start"`, yields, and records `"stop"` even when the block raises. Output should be `[\'open\', \'start\', \'stop\', \'close\']`.',
          equals: "['open', 'start', 'stop', 'close']",
          ast: 'finally',
          hidden: true,
          hints: ladder(
            'Only `"start"` reaches `EVENTS` today: the class records nothing, and the generator\'s teardown is skipped by the raise.',
            '`__enter__` should append `"open"` and `return self`; `__exit__` should append `"close"` and return `False`. In `shift`, put the `yield` in a `try` and the `"stop"` append in a `finally`.',
            'A lock reads the same way: `acquire()` before the `yield`, `release()` in the `finally`, so the lock is freed whether the block succeeded or blew up.',
            `from contextlib import contextmanager

EVENTS = []


class Station:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        EVENTS.append("open")
        return self

    def __exit__(self, exc_type, exc, tb):
        EVENTS.append("close")
        return False


@contextmanager
def shift(name):
    EVENTS.append("start")
    try:
        yield name
    finally:
        EVENTS.append("stop")


try:
    with Station("north") as post, shift("dawn"):
        raise ValueError("storm")
except ValueError:
    pass

print(EVENTS)`
          )
        })
      ]
    }),
    files: {
      'main.py': `from contextlib import contextmanager

EVENTS = []


class Station:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


@contextmanager
def shift(name):
    EVENTS.append("start")
    yield name
    EVENTS.append("stop")


try:
    with Station("north") as post, shift("dawn"):
        raise ValueError("storm")
except ValueError:
    pass

print(EVENTS)
`,
      'hidden_test.py': importAssert(`main.EVENTS.clear()
with main.Station("north") as post:
    assert post.name == "north", "__enter__ should hand back the station"
assert main.EVENTS == ["open", "close"], "record both ends of the managed block"

main.EVENTS.clear()
try:
    with main.shift("dawn"):
        raise KeyError("missing")
except KeyError:
    pass
else:
    raise AssertionError("__exit__ must not swallow the error")
assert main.EVENTS == ["start", "stop"], "the finally block has to run on the way out"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'type-hints',
      courseId: 'internals',
      moduleId: 'wrap',
      title: 'Hints are documentation, not guards',
      skillIds: ['python.typing'],
      estimatedMinutes: 22,
      blocks: [
        teach({
          heading: 'Annotations are data on the function',
          idea:
            'An annotation records what you *intend*: `def average(values: list[int]) -> float`. Python stores it in `average.__annotations__` and then ignores it completely. Nothing is converted, nothing is rejected, and no check happens at call time — the payoff comes from editors, `mypy`, and the next person reading the signature.',
          bites:
            'This bites when a hint is treated as a guarantee. `average("12")` still runs, and the failure — if there is one — arrives later and somewhere else. Write the hint to describe the contract you mean: `list[int]` for a list of whole numbers, `str | None` (the same thing as `Optional[str]`) when the value is genuinely allowed to be missing.',
          code: `def average(values: list[int]) -> float:
    return sum(values) / len(values)

def label(name: str | None) -> str:
    return name if name is not None else "unnamed"

print(average.__annotations__["values"])   # list[int] - just stored data
print(label(7))                            # 7 - the hint never stopped it`,
          mistake:
            'A common mistake is writing `str | None` on a parameter and then forgetting the `None` branch in the body — the hint documents the case, it does not handle it. The exercise asks you to annotate both functions and print one annotation back, so you can see it is an ordinary value living on the function object.'
        }),
        predict(
          'hint-at-runtime',
          '`def average(values: list[int]) -> float` is called as `average(["1", "2"])`. What does Python do about the hint?',
          [
            { id: 'raises', md: 'Raises a `TypeError` before the body runs', misconceptionId: 'hints-are-enforced' },
            { id: 'ignores', md: 'Nothing — the body runs and fails or succeeds on its own' }
          ],
          'ignores',
          {
            explainMd:
              'Hints are never checked at runtime. The call goes through, and this particular body then fails inside `sum` because strings cannot be added to `0` — an error about `sum`, not about your annotation. A type checker run before you ship is what turns the hint into a real guard.'
          }
        ),
        check(
          'optional-meaning',
          'What does `name: str | None` tell a reader?',
          [
            { id: 'either', md: 'The value is either a string or `None`, and the body should cope with both' },
            { id: 'default', md: 'The parameter defaults to `None`' },
            { id: 'checked', md: 'Python will reject anything else', misconceptionId: 'hints-are-enforced' }
          ],
          'either',
          {
            explainMd:
              '`str | None` is a union: two allowed shapes, and the body owes you a branch for the `None` case. It says nothing about defaults — `name: str | None = None` is what adds one. `Optional[str]` from `typing` means exactly the same union in older code.'
          }
        ),
        tf(
          'annotations-visible',
          'Annotations are readable at runtime through the function\'s `__annotations__` dictionary.',
          true,
          {
            explainMd:
              'They are stored as an ordinary dict keyed by parameter name, plus `"return"` for the result. Tools like `dataclasses`, `pydantic`, and `typing.get_type_hints` read that dict, which is how a hint can drive real behaviour — but only because a library chose to look.'
          }
        ),
        pyCode({
          id: 'annotate-two',
          prompt:
            '> Annotate both functions — `average` takes a `list[int]` and returns a `float`; `label` takes `str | None` and returns a `str` — and make `label(None)` return `"unnamed"`. Output should be `2.0 unnamed list[int]`.',
          equals: '2.0 unnamed list[int]',
          ast: '-> float',
          hidden: true,
          hints: ladder(
            'Two things are missing: the annotations, and the `None` branch inside `label`.',
            'A parameter is annotated as `name: type` and the result after the parameter list as `-> type`. Use the built-in generic `list[int]` and the union `str | None`.',
            '`def clamp(value: int, top: int) -> int:` annotates two parameters and the result; the body is unchanged by any of it.',
            `def average(values: list[int]) -> float:
    return sum(values) / len(values)


def label(name: str | None) -> str:
    return name if name is not None else "unnamed"


print(average([1, 2, 3]), label(None), average.__annotations__.get("values", "missing"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def average(values):
    return sum(values) / len(values)


def label(name):
    return name


print(average([1, 2, 3]), label(None), average.__annotations__.get("values", "missing"))
`,
      'hidden_test.py': importAssert(`assert main.average.__annotations__["values"] == list[int], "annotate values as list[int]"
assert main.average.__annotations__["return"] is float, "annotate the result as float"
assert main.label.__annotations__["name"] == (str | None), "annotate name as str | None"
assert main.label.__annotations__["return"] is str

assert main.label(None) == "unnamed"
assert main.label("north") == "north"
assert main.label(7) == 7, "nothing checks the hint at runtime"
assert main.average([2, 4]) == 3.0`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-lazy-reader',
      courseId: 'internals',
      moduleId: 'wrap',
      title: 'Transfer: a lazy reader for the station log',
      skillIds: ['python.internals.iteration', 'python.internals.context'],
      estimatedMinutes: 28,
      mastery: { requiresTransfer: true },
      blocks: [
        teach({
          heading: 'Put the two halves together',
          idea:
            'A real reader needs both ideas from this module at once. A context manager owns the file and closes it whatever happens; a chain of generators turns raw lines into the values you want, one line at a time. Together they read a log of any size with one handle and one line in memory.',
          bites:
            'A file object is already an iterator over its lines, so it drops straight into the front of a pipeline — no `readlines()`, no list. The station log is messy: comment lines start with `#`, some lines are blank, some are padded with spaces, and some rows are not readings at all. Each of those is one small stage that yields what it keeps and silently skips the rest.',
          code: `from contextlib import contextmanager

@contextmanager
def opened(path):
    handle = open(path, encoding="utf-8")
    try:
        yield handle
    finally:
        handle.close()

def wanted(lines):
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#"):
            yield line

with opened("notes.txt") as handle:
    for row in wanted(handle):
        print(row)`,
          mistake:
            'A common mistake is returning the pipeline out of the `with` block and consuming it afterwards — by then the file is closed and you get `ValueError: I/O operation on closed file`. Do the consuming inside the block. The exercise asks for the whole reader: one manager, two generator stages, and the total of the `temp=` rows in `station.log`.'
        }),
        predict(
          'file-is-iterator',
          'What does `for line in handle:` iterate over for an open text file?',
          [
            { id: 'lines', md: 'Its lines, one at a time, without loading the file' },
            { id: 'chars', md: 'Its characters' },
            { id: 'nothing', md: 'Nothing until you call `readlines()` first' }
          ],
          'lines',
          {
            explainMd:
              'A text file object implements the iterator protocol over lines, so it is already a lazy stream and can be the first stage of a pipeline. `readlines()` is the eager alternative: it hands back a list of every line, which is the one thing you were trying to avoid.'
          }
        ),
        check(
          'consume-outside-with',
          'You return `temps(records(handle))` from inside the `with` and call `sum()` on it afterwards. What happens?',
          [
            { id: 'fine', md: 'It works — the generator kept the data' },
            { id: 'closed', md: '`ValueError`: the file was closed before the pipeline read it' }
          ],
          'closed',
          {
            explainMd:
              'The pipeline had not read anything yet, so the reading happens after `__exit__` has closed the handle. Laziness means the work moves to wherever you consume it — so consume inside the block, or have the manager itself yield finished values rather than an open handle.'
          }
        ),
        reflect(
          'reader-shape',
          'In one or two sentences: which part of your reader guarantees the file closes, and which part guarantees the log is never all in memory at once?'
        ),
        pyCode({
          id: 'lazy-reader',
          prompt:
            '> Build the reader over `station.log`. `opened(path)` is a `@contextmanager` that closes the file even when the block raises. `records(lines)` yields each line stripped, skipping blanks and `#` comments. `temps(rows)` yields the integer from every `temp=` row. Output should be `12`.',
          equals: '12',
          hidden: true,
          roFiles: ['station.log'],
          hints: ladder(
            'Both stages return empty lists today, so the total is 0. The log is read-only — read it, do not rewrite it.',
            '`records`: strip the line, `continue` on an empty line or one starting with `#`, otherwise `yield` it. `temps`: split each row once on `=` and `yield int(value)` when the left side is `temp`.',
            '`kind, _, value = row.partition("=")` splits `"temp=4"` into `"temp"`, `"="`, `"4"` and leaves a row with no `=` sign as `("bad line", "", "")`, which the `if` then skips.',
            `from contextlib import contextmanager


@contextmanager
def opened(path):
    handle = open(path, encoding="utf-8")
    try:
        yield handle
    finally:
        handle.close()


def records(lines):
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        yield line


def temps(rows):
    for row in rows:
        kind, _, value = row.partition("=")
        if kind == "temp":
            yield int(value)


with opened("station.log") as handle:
    print(sum(temps(records(handle))))`
          )
        })
      ]
    }),
    files: {
      'main.py': `from contextlib import contextmanager


@contextmanager
def opened(path):
    handle = open(path, encoding="utf-8")
    yield handle
    handle.close()


def records(lines):
    return []


def temps(rows):
    return []


with opened("station.log") as handle:
    print(sum(temps(records(handle))))
`,
      'station.log': `# north station, day 4
temp=3

wind=9
  temp=4
temp=5
sensor rebooted
`,
      'hidden_test.py': importAssert(`import inspect
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "finally" in src, "the reader must close the file even when the block raises"
assert inspect.isgeneratorfunction(main.records), "records should yield, not build a list"
assert inspect.isgeneratorfunction(main.temps), "temps should yield, not build a list"

assert list(main.records(["# note", "", "  temp=1  ", "wind=2"])) == ["temp=1", "wind=2"]
assert list(main.temps(["temp=1", "wind=2", "temp=3", "sensor rebooted"])) == [1, 3]

try:
    with main.opened("station.log") as handle:
        raise RuntimeError("storm")
except RuntimeError:
    pass
assert handle.closed, "close has to survive an exception inside the block"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'blocking-vs-waiting',
      courseId: 'waiting',
      moduleId: 'why',
      title: 'Waiting is not working',
      skillIds: ['python.async'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'Two very different kinds of slow',
          idea:
            'Computing is slow because the CPU is busy: averaging a million readings takes real work. Waiting is slow because something else is busy — a disk, a sensor, another machine — and your process has nothing to do but sit there. The two look identical from the outside and need opposite treatments.',
          bites:
            'This bites when three waits are served one after another. Ten seconds of waiting is ten seconds of an idle CPU, and the total is the sum of the waits even though nothing was competing for anything. Let the waits overlap and the total collapses to the longest single wait — the work was never the bottleneck, the queueing was.',
          code: `waits = [3, 5, 2]

print(sum(waits))                  # 10 - one wait at a time
print(max(waits, default=0))       # 5  - all three waiting together

# Overlapping only helps the second case. Three seconds of arithmetic
# stays three seconds of arithmetic however you arrange it.`,
          mistake:
            'A common mistake is reaching for concurrency to speed up a calculation. Overlapping waits costs nothing because the CPU was idle anyway; overlapping computations just shares the same CPU between them. The exercise asks you to model both totals, including the empty case where there is nothing to wait for at all.'
        }),
        predict(
          'three-waits',
          'Three independent waits of 3, 5, and 2 seconds, done one after another. Total?',
          [
            { id: 'ten', md: '10 seconds' },
            { id: 'five', md: '5 seconds' }
          ],
          'ten',
          {
            explainMd:
              'Sequential waiting adds up: nothing starts until the one before it has finished, so the total is 3 + 5 + 2. Started together, the three waits overlap and the slowest one sets the pace, giving 5 — which is the whole reason the rest of this course exists.'
          }
        ),
        check(
          'which-benefits',
          'Which job gets faster by overlapping it with others?',
          [
            { id: 'io', md: 'Reading four files from disk' },
            { id: 'cpu', md: 'Averaging a million readings in a loop' },
            { id: 'both', md: 'Both, equally' }
          ],
          'io',
          {
            explainMd:
              'The file reads spend their time waiting on the disk, so overlapping them puts an idle process to work. The averaging is CPU-bound: the work is real and interleaving it just splits the same processor between halves of the job, so the total barely moves.'
          }
        ),
        cloze(
          'wait-words',
          'While a task is waiting on I/O, the CPU is {{a}}, so overlapping waits costs {{b}}.',
          [
            { id: 'a', choices: ['idle', 'saturated', 'copying data'] },
            { id: 'b', choices: ['almost nothing', 'twice as much', 'one core per wait'] }
          ],
          { a: 'idle', b: 'almost nothing' },
          {
            explainMd:
              'An idle CPU is the resource concurrency spends. Because a waiting task needs no processor time, one thread of execution can babysit dozens of outstanding waits — which is exactly what an event loop does in the next lesson.'
          }
        ),
        pyCode({
          id: 'plan-the-waits',
          prompt:
            '> Finish both planners. `blocking_plan(waits)` adds the waits up, because nothing overlaps. `overlapped_plan(waits)` returns the longest single wait, and must return `0` when there is nothing to wait for. Output should be `10 5`.',
          equals: '10 5',
          ast: 'max(',
          hidden: true,
          hints: ladder(
            'Both planners currently add the waits up, so overlapping looks like it saves nothing.',
            'Sequential waiting is `sum(waits)`. Overlapped waiting is the largest wait — and `max` on an empty list raises unless you give it a fallback.',
            '`max([], default=0)` is `0`, while plain `max([])` raises `ValueError`. The same `default=` keyword works on `min`.',
            `WAITS = [3, 5, 2]


def blocking_plan(waits):
    return sum(waits)


def overlapped_plan(waits):
    return max(waits, default=0)


print(blocking_plan(WAITS), overlapped_plan(WAITS))`
          )
        })
      ]
    }),
    files: {
      'main.py': `WAITS = [3, 5, 2]


def blocking_plan(waits):
    return sum(waits)


def overlapped_plan(waits):
    return sum(waits)


print(blocking_plan(WAITS), overlapped_plan(WAITS))
`,
      'hidden_test.py': importAssert(`assert main.blocking_plan([1, 2, 3]) == 6
assert main.blocking_plan([]) == 0
assert main.overlapped_plan([1, 2, 3]) == 3, "overlapped waiting ends with the slowest wait"
assert main.overlapped_plan([4]) == 4
assert main.overlapped_plan([]) == 0, "nothing to wait for is no waiting at all"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'async-def-await',
      courseId: 'waiting',
      moduleId: 'why',
      title: 'async def, and what await really does',
      skillIds: ['python.async'],
      estimatedMinutes: 22,
      blocks: [
        teach({
          heading: 'A coroutine is a plan, not a running job',
          idea:
            'Calling an `async def` function runs none of its body. It builds a **coroutine object** — a plan — and nothing happens until something drives it: an `await` from inside another coroutine, or `asyncio.run()` from ordinary code. That is why an unawaited call gives you `<coroutine object ...>` and a warning instead of a result.',
          bites:
            '`await` is the opposite of a freeze. It says "I am waiting; run something else and come back to me", handing control to the event loop, which is free to advance any other task that is ready. The program does not stop — only this coroutine pauses, exactly at the `await`, and resumes there once the thing it waited on is done.',
          code: `import asyncio

async def read_cell(name):
    await asyncio.sleep(0)          # yield control, then carry on
    return f"{name} clear"

plan = read_cell("north")
print(type(plan).__name__)          # coroutine - nothing has run yet
plan.close()

print(asyncio.run(read_cell("east")))   # east clear`,
          mistake:
            'A common mistake is calling an async function and using the result as a value: `total = fetch()` gives you a coroutine, not a number, and the bug surfaces far from the cause. `asyncio.run` is for the single entry point at the top; inside a coroutine you use `await`, and never `asyncio.run` again. The exercise asks you to await two cells and join the answers.'
        }),
        predict(
          'call-without-await',
          '`plan = read_cell("north")` where `read_cell` is an `async def`. What is `plan`?',
          [
            { id: 'coro', md: 'A coroutine object; the body has not run' },
            { id: 'string', md: 'The string the function returns' }
          ],
          'coro',
          {
            explainMd:
              'The call only builds the coroutine. Its body waits until something awaits it or `asyncio.run` drives it, and if nobody ever does, Python warns that a coroutine was never awaited. This is the most common async bug and the reason the next lesson in this module is a repair job.'
          }
        ),
        check(
          'await-blocks',
          'What does `await something` do to the rest of the program?',
          [
            { id: 'freezes', md: 'Freezes everything until the wait is over', misconceptionId: 'await-blocks-everything' },
            { id: 'yields', md: 'Pauses this coroutine and lets the loop run other ready tasks' }
          ],
          'yields',
          {
            explainMd:
              '`await` is a hand-off, not a halt: this coroutine parks at that exact line and the event loop gets control back to advance anything else that is ready. What *does* freeze everything is a blocking call like `time.sleep` inside a coroutine, because it never gives the loop a turn.'
          }
        ),
        tf(
          'run-once',
          '`asyncio.run` is meant to be called once, at the top of the program, not inside a coroutine.',
          true,
          {
            explainMd:
              '`asyncio.run` creates an event loop, drives one coroutine to completion, and closes the loop. Calling it inside a running coroutine raises, because a loop is already going — from in there, `await` is the way to run another coroutine.'
          }
        ),
        pyCode({
          id: 'sweep-two-cells',
          prompt:
            '> Finish `sweep` so it awaits `read_cell("north")` and then `read_cell("east")` and returns the two answers joined with `" | "`. Output should be `coroutine north clear | east clear`.',
          equals: 'coroutine north clear | east clear',
          ast: 'await read_cell',
          hidden: true,
          hints: ladder(
            '`sweep` returns a placeholder string, so the printed line never shows either cell.',
            'Inside an `async def`, `await read_cell("north")` gives you the finished string. Await both, then join them with `" | "`.',
            'Awaiting into a name reads like ordinary code: `first = await read_cell("north")`, and from there `first` is just a string.',
            `import asyncio


async def read_cell(name):
    await asyncio.sleep(0)
    return f"{name} clear"


async def sweep():
    first = await read_cell("north")
    second = await read_cell("east")
    return " | ".join([first, second])


pending = read_cell("north")
print(type(pending).__name__, asyncio.run(sweep()))
pending.close()`
          )
        })
      ]
    }),
    files: {
      'main.py': `import asyncio


async def read_cell(name):
    await asyncio.sleep(0)
    return f"{name} clear"


async def sweep():
    return "nothing yet"


pending = read_cell("north")
print(type(pending).__name__, asyncio.run(sweep()))
pending.close()
`,
      'hidden_test.py': importAssert(`import asyncio
import inspect

assert inspect.iscoroutinefunction(main.sweep), "sweep should be an async def"
assert asyncio.run(main.sweep()) == "north clear | east clear"

later = main.read_cell("west")
assert inspect.iscoroutine(later), "calling a coroutine function only builds a coroutine"
later.close()`)
    }
  })

  out.push({
    doc: lesson({
      id: 'gather-concurrency',
      courseId: 'waiting',
      moduleId: 'together',
      title: 'gather: start both, then wait',
      skillIds: ['python.async'],
      estimatedMinutes: 22,
      blocks: [
        teach({
          heading: 'Sequential awaits are still sequential',
          idea:
            '`await one()` then `await two()` gives you no overlap at all. The first coroutine has to finish before the second is even started, so two one-second waits still take two seconds. Being async does not make anything concurrent; scheduling more than one job at a time does.',
          bites:
            '`asyncio.gather(one(), two())` wraps each coroutine in a task, hands them all to the loop, and waits for the lot. Each task runs until its first `await`, at which point the loop starts the next one — so both are in flight before either is finished. `gather` returns the results as a list in the order you passed them in, not the order they completed.',
          code: `import asyncio

order = []

async def check(name):
    order.append(f"{name}+")
    await asyncio.sleep(0)
    order.append(f"{name}-")
    return name

async def main():
    return await asyncio.gather(check("a"), check("b"))

print(asyncio.run(main()))   # ['a', 'b'] - argument order
print(order)                 # ['a+', 'b+', 'a-', 'b-'] - both started first`,
          mistake:
            'A common mistake is `await`ing inside a `for` loop and calling it concurrency. Collect the coroutines and hand them to `gather` in one go — `await asyncio.gather(*[check(n) for n in names])`. The exercise records the order each coroutine starts and finishes, so overlap is something you can actually see.'
        }),
        predict(
          'gather-order',
          'Each `check` appends `name+`, awaits, then appends `name-`. Under `gather(check("a"), check("b"))`, what does the record look like?',
          [
            { id: 'overlap', md: '`a+`, `b+`, `a-`, `b-`' },
            { id: 'serial', md: '`a+`, `a-`, `b+`, `b-`' }
          ],
          'overlap',
          {
            explainMd:
              'Both tasks start before either finishes: `a` runs to its `await` and gives up control, `b` does the same, then the loop resumes them in turn. Sequential awaits produce the second record instead — the giveaway that nothing actually overlapped.'
          }
        ),
        check(
          'gather-results-order',
          '`gather` finishes. In what order are the results?',
          [
            { id: 'args', md: 'The order you passed the coroutines in' },
            { id: 'done', md: 'The order they completed in' }
          ],
          'args',
          {
            explainMd:
              '`gather` returns a list positionally, so `results[0]` always belongs to the first coroutine you passed however slow it was. If you want them as they finish, that is a different tool — `asyncio.as_completed`, which yields awaitables in completion order.'
          }
        ),
        tf(
          'await-in-loop',
          '`for name in names: await check(name)` runs the checks concurrently.',
          false,
          {
            explainMd:
              'That loop is strictly one at a time: each `await` waits for its coroutine to finish before the next iteration begins. Build the coroutines first and pass them all to `gather` — `await asyncio.gather(*(check(n) for n in names))` — to get any overlap.'
          }
        ),
        pyCode({
          id: 'overlap-two',
          prompt:
            '> Rewrite `all_at_once` with `asyncio.gather` so both checks are started before either finishes, and return their results as a list. Output should be `True [\'a+\', \'b+\', \'a-\', \'b-\']`.',
          equals: "True ['a+', 'b+', 'a-', 'b-']",
          ast: 'gather',
          hidden: true,
          hints: ladder(
            '`all_at_once` awaits inside a loop, so its record matches the sequential one instead of overlapping. Leave `one_at_a_time` alone — it is the comparison.',
            '`asyncio.gather(...)` takes the coroutines as separate arguments and is itself awaited: `return await asyncio.gather(check("a"), check("b"))`.',
            'With a list of names it is `await asyncio.gather(*(check(name) for name in names))` — the star spreads the coroutines out as arguments.',
            `import asyncio

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
    return await asyncio.gather(check("a"), check("b"))


async def compare():
    ORDER.clear()
    await one_at_a_time()
    stepwise = list(ORDER)
    ORDER.clear()
    await all_at_once()
    return stepwise, list(ORDER)


stepwise, overlapped = asyncio.run(compare())
print(stepwise == ["a+", "a-", "b+", "b-"], overlapped)`
          )
        })
      ]
    }),
    files: {
      'main.py': `import asyncio

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
`,
      'hidden_test.py': importAssert(`import asyncio

main.ORDER.clear()
assert asyncio.run(main.all_at_once()) == ["a", "b"], "gather returns results in argument order"
assert main.ORDER == ["a+", "b+", "a-", "b-"], "both checks should start before either finishes"

main.ORDER.clear()
asyncio.run(main.one_at_a_time())
assert main.ORDER == ["a+", "a-", "b+", "b-"], "leave the sequential version sequential"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'threads-vs-processes',
      courseId: 'waiting',
      moduleId: 'together',
      title: 'Threads, processes, and the GIL',
      skillIds: ['python.async'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Three tools, one question to ask first',
          idea:
            'CPython holds a **global interpreter lock**: one thread executes Python bytecode at a time inside a process. Threads still help, because the lock is released while a thread waits on I/O — so four downloads in four threads genuinely overlap. What they cannot do is run four calculations on four cores, because only one of them can hold the lock.',
          bites:
            'So the first question is never "threads or async" — it is "is this job waiting or working". Waiting work suits `asyncio` (one thread, thousands of pending waits, no locking to think about) or a thread pool when the library you must call is blocking. Working work needs `multiprocessing`: separate processes, one interpreter and one lock each, real parallelism — paid for with startup cost and data that has to be pickled across the boundary.',
          code: `# Waiting on the network or the disk: overlap it.
#   asyncio.gather(...)                 - one thread, explicit await points
#   ThreadPoolExecutor                  - blocking libraries you cannot rewrite
#
# Working the CPU: give it more interpreters.
#   ProcessPoolExecutor                 - real cores, pickled arguments
#
# Threads share memory, so two threads touching one list need a lock.
# Processes share nothing, so they need a queue or a pipe instead.`,
          mistake:
            'A common mistake is adding threads to a number-crunching loop and finding it slightly slower — the GIL was never the thing making it slow, and now there is contention on top. The mirror mistake is reaching for `multiprocessing` to fetch four files, paying for four interpreters to sit and wait. Decide with the profile, not the reflex: measure whether the time goes on waiting or on working, then pick the tool that addresses that.'
        }),
        predict(
          'gil-effect',
          'Four CPU-heavy calculations in four Python threads, on a four-core machine. Roughly how fast compared with running them one after another?',
          [
            { id: 'four', md: 'About four times faster — one per core' },
            { id: 'same', md: 'About the same, or slightly slower' }
          ],
          'same',
          {
            explainMd:
              'The GIL lets only one thread run Python bytecode at a time, so the four calculations take turns on a single core and the total barely changes — while the switching adds a little overhead of its own. Four processes would use the four cores, because each process has its own interpreter and its own lock.'
          }
        ),
        check(
          'pick-the-tool',
          'A blocking third-party client makes four network calls that mostly sit and wait. You cannot rewrite it. Best tool?',
          [
            { id: 'threads', md: 'A thread pool — the lock is released while each call waits' },
            { id: 'processes', md: 'A process pool, to dodge the GIL' },
            { id: 'asyncio', md: '`asyncio.gather` over the blocking client' }
          ],
          'threads',
          {
            explainMd:
              'Threads are the right fit for blocking I/O: while a call waits, its thread drops the GIL and the others run, so the waits overlap. `asyncio` cannot help a blocking client — calling it inside a coroutine stalls the whole loop — and processes would pay startup and pickling costs for work that is only waiting.'
          }
        ),
        tf(
          'processes-share-memory',
          'Two processes started with `multiprocessing` share the same variables, so one can append to the other\'s list.',
          false,
          {
            explainMd:
              'Each process gets its own memory and its own copy of everything, which is why arguments and results have to be pickled across the boundary. That isolation is also the appeal: no shared state means no data races and no locks, at the cost of copying anything you want to pass along.'
          }
        ),
        cloze(
          'tool-words',
          'A job that is mostly {{a}} wants concurrency; a job that is mostly {{b}} wants more processes.',
          [
            { id: 'a', choices: ['waiting on I/O', 'crunching numbers', 'importing modules'] },
            { id: 'b', choices: ['crunching numbers', 'waiting on I/O', 'logging'] }
          ],
          { a: 'waiting on I/O', b: 'crunching numbers' },
          {
            explainMd:
              'Concurrency fills in idle time, so it pays off exactly when the process is idle — waiting on I/O. Parallelism buys more workers, which is what a CPU-bound job needs, and in CPython more workers means more processes because the GIL allows only one thread of bytecode per interpreter.'
          }
        ),
        reflect(
          'own-workload',
          'Think of something slow you have written or used. Was the time going on waiting or on working — and which of the three tools would you reach for?'
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'debug-forgotten-await',
      courseId: 'waiting',
      moduleId: 'together',
      title: 'Debug: the missing await',
      skillIds: ['python.async'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'A coroutine object where a value should be',
          idea:
            'The loudest symptom in async Python is a value that prints as `<coroutine object scan at 0x...>`. It means a coroutine function was called and never awaited, so what came back was the plan rather than the result. Python usually adds a `RuntimeWarning: coroutine ... was never awaited` on the way out.',
          bites:
            'The call site looks completely normal, which is what makes it slippery: `lines.append(scan(cell))` is valid Python and raises nothing at that line. The failure surfaces later and somewhere else — a join complaining that a coroutine is not a string, an arithmetic error on a coroutine, or output full of object repr. Trace it back to the first place a coroutine was stored instead of awaited.',
          code: `import asyncio

async def scan(cell):
    await asyncio.sleep(0)
    return f"{cell}: clear"

async def broken():
    return scan("north")          # no await: hands back the plan

print(asyncio.run(broken()))      # <coroutine object scan at 0x...>`,
          mistake:
            'A common mistake is trying to fix this from the outside — wrapping the printout in `str()`, or calling `asyncio.run` a second time on the leaked coroutine. Neither touches the cause. This starter is broken on purpose: find the place a coroutine is collected without being awaited, and await it there.'
        }),
        predict(
          'what-prints',
          '`lines.append(scan(cell))` inside a coroutine, where `scan` is an `async def`. What lands in the list?',
          [
            { id: 'coro', md: 'A coroutine object' },
            { id: 'string', md: 'The string `scan` returns' }
          ],
          'coro',
          {
            explainMd:
              'Calling a coroutine function only builds the coroutine, so that is what gets appended. The list is now full of plans nobody ran, and the first thing that treats them as strings — a `join`, an f-string, a comparison — is where you notice. `lines.append(await scan(cell))` stores the result instead.'
          }
        ),
        check(
          'where-to-fix',
          'The output shows `<coroutine object ...>`. Where is the repair?',
          [
            { id: 'await', md: 'At the call: `await` the coroutine so the value comes back' },
            { id: 'str', md: 'At the print: convert the coroutine to a string' },
            { id: 'run', md: 'Call `asyncio.run` again on the coroutine that leaked' }
          ],
          'await',
          {
            explainMd:
              'The value is missing because nobody ever ran the coroutine, so the fix belongs at the call site. Converting it to text hides the symptom and keeps the work undone, and `asyncio.run` cannot be called from inside a coroutine that is already being driven by a running loop.'
          }
        ),
        tf(
          'warning-meaning',
          '"coroutine ... was never awaited" means the coroutine was created and then thrown away without running.',
          true,
          {
            explainMd:
              'Python emits that warning when a coroutine object is garbage-collected without ever having been driven. Treat it as a pointer to a missing `await` rather than noise — it names the coroutine function, which is usually enough to find the exact call.'
          }
        ),
        pyCode({
          id: 'repair-await',
          debug: true,
          prompt:
            '> This sweep prints a coroutine object instead of the readings. Repair it so both cells are scanned and joined. Output should be `north: clear | east: clear`.',
          equals: 'north: clear | east: clear',
          ast: 'await scan',
          hidden: true,
          hints: ladder(
            'Look at what goes into `lines`, then at what `sweep` returns. One of those is a plan and not a value.',
            '`scan(cell)` builds a coroutine; `await scan(cell)` runs it and gives you the string. The loop should collect strings, and `sweep` should return the joined text.',
            'The repair is one keyword in one place: `lines.append(await scan(cell))`. Everything downstream then handles ordinary strings.',
            `import asyncio


async def scan(cell):
    await asyncio.sleep(0)
    return f"{cell}: clear"


async def sweep():
    lines = []
    for cell in ("north", "east"):
        lines.append(await scan(cell))
    return " | ".join(lines)


print(asyncio.run(sweep()))`
          )
        })
      ]
    }),
    files: {
      'main.py': `import asyncio


async def scan(cell):
    await asyncio.sleep(0)
    return f"{cell}: clear"


async def sweep():
    lines = []
    for cell in ("north", "east"):
        lines.append(scan(cell))
    return lines[0]


print(asyncio.run(sweep()))
`,
      'hidden_test.py': importAssert(`import asyncio

assert asyncio.run(main.scan("west")) == "west: clear"
assert asyncio.run(main.sweep()) == "north: clear | east: clear", "both cells, joined with ' | '"`)
    }
  })

  return out
}
