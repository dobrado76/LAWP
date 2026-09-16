import { lesson, teach, predict, check, cloze, tf, ladder, pyCode, importAssert } from './lib.mjs'

/**
 * Fluency: collections, errors, and text. The cover story is one field station —
 * a fox on a grid, a gradebook of station records, and a log nobody tidied.
 */
export function lessonsFluency() {
  const out = []

  // ---------------------------------------------------------------- sequences

  out.push({
    doc: lesson({
      id: 'lists-index-slice',
      courseId: 'collections',
      moduleId: 'sequences',
      title: 'Index from zero, slice to before',
      skillIds: ['python.collections.list'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'A numbered shelf',
          idea:
            'A list is a numbered shelf, and the numbering starts at zero. The first reading sits at index `0`, the fifth at index `4`. A negative index counts backwards from the far end, so `readings[-1]` is the shortest way to say "whatever is last".',
          bites:
            'This bites at both ends of a slice. `readings[1:4]` starts **at** index 1 but stops **before** index 4, so it hands back three items and never touches the fourth. It bites again when you forget that a slice builds a second list: the original shelf is still exactly as it was.',
          code: `readings = [12, 7, 19, 3, 22]
print(readings[0])     # 12  - the first item
print(readings[-1])    # 22  - the last item
print(readings[1:4])   # [7, 19, 3] - from 1, stopping before 4
print(readings[:2])    # [12, 7] - a missing start means "from the beginning"
print(readings)        # unchanged: slicing never edits the original`,
          mistake:
            'A common mistake is reaching for `readings[len(readings)]` when you want the last item. That index is one step past the end and raises `IndexError`. The exercise asks for two small functions over one list of station readings, so you have to say "from here to there" and "the last one" without counting positions by hand.'
        }),
        predict(
          'slice-window',
          '`readings = [12, 7, 19, 3, 22]`. What is `readings[1:4]`?',
          [
            { id: 'four', md: '`[7, 19, 3, 22]`' },
            { id: 'three', md: '`[7, 19, 3]`' }
          ],
          'three',
          {
            explainMd:
              'A slice is half-open: it includes the start index and stops just before the end index. Indexes 1, 2 and 3 are taken, index 4 is not, so you get three items. A quick way to predict the length is `end - start`, which here is `4 - 1`.'
          }
        ),
        tf(
          'negative-last',
          '`readings[-1]` reads the last item of the list.',
          true,
          {
            explainMd:
              'Negative indexes count from the end, so `-1` is the last item, `-2` the one before it. This is why you rarely need the length of a list to reach its tail, and why `readings[-1]` keeps working after the list grows.'
          }
        ),
        cloze(
          'slice-words',
          'In `readings[1:4]`, index 1 is {{a}} and index 4 is {{b}}.',
          [
            { id: 'a', choices: ['included', 'excluded', 'ignored'] },
            { id: 'b', choices: ['excluded', 'included', 'doubled'] }
          ],
          { a: 'included', b: 'excluded' },
          {
            explainMd:
              'Python slices include the start and exclude the end. Saying it out loud as "from 1, stopping before 4" keeps the count right, and it is the same rule `range(1, 4)` follows when it yields 1, 2, 3.'
          }
        ),
        pyCode({
          id: 'slice-readings',
          prompt:
            '> Write `middle_three(readings)` so it returns the second, third, and fourth readings, and `last(readings)` so it returns the final one. Print `middle_three([12, 7, 19, 3, 22])`.',
          equals: '[7, 19, 3]',
          hidden: true,
          hints: ladder(
            'The second item is at index 1, not index 2. Counting starts at zero, so write the indexes down before you write the slice.',
            'A slice is `list[start:end]` and it stops *before* `end`. To take three items starting at index 1, the end index is 4. For the final item, a negative index saves you from measuring the list.',
            'For `codes = ["a", "b", "c", "d"]`, `codes[1:3]` is `["b", "c"]` and `codes[-1]` is `"d"`.',
            `def middle_three(readings):
    return readings[1:4]


def last(readings):
    return readings[-1]


print(middle_three([12, 7, 19, 3, 22]))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def middle_three(readings):
    return readings


def last(readings):
    return readings[0]


print(middle_three([12, 7, 19, 3, 22]))
`,
      'hidden_test.py': importAssert(`assert main.middle_three([12, 7, 19, 3, 22]) == [7, 19, 3]
assert main.middle_three([1, 2, 3, 4, 5, 6]) == [2, 3, 4]
assert main.last([12, 7, 19, 3, 22]) == 22
assert main.last([5]) == 5

shelf = [1, 2, 3, 4, 5]
taken = main.middle_three(shelf)
assert taken is not shelf, "a slice should hand back a new list"
taken.append(99)
assert shelf == [1, 2, 3, 4, 5], "editing the slice must not touch the original"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'list-mutation-vs-copy',
      courseId: 'collections',
      moduleId: 'sequences',
      title: 'Two names, one list',
      skillIds: ['python.collections.list'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Assignment does not copy',
          idea:
            'Writing `b = a` does not build a second list. It presses a second sticky note onto the list that is already there, so `a` and `b` are two labels on one object. Appending through either name is visible through both, because there is only one list to change.',
          bites:
            'This bites the first time a helper function "just tidies up" the list you handed it. The caller keeps its own name, the helper keeps another, and both names lead to the same shelf, so the caller silently gets the edit. A log you meant to leave untouched comes back three lines longer.',
          code: `a = [1, 2]
b = a           # a second label on the same list
b.append(3)
print(a)        # [1, 2, 3] - one list, seen through two names

c = a.copy()    # list(a) and a[:] do the same job
c.append(4)
print(a)        # [1, 2, 3] - untouched
print(c)        # [1, 2, 3, 4]`,
          mistake:
            'A common mistake is calling `.copy()` and then still editing the original by habit. Copying only helps if the edits go to the copy. The exercise asks for `add_reading(log, value)` that hands back a longer list while leaving the list it was given exactly as the caller left it.'
        }),
        predict(
          'alias-append',
          '`a = [1]`, then `b = a`, then `b.append(2)`. What is `a`?',
          [
            { id: 'one', md: '`[1]` — `b` was a copy', misconceptionId: 'assignment-copies-a-list' },
            { id: 'two', md: '`[1, 2]` — both names point at one list' }
          ],
          'two',
          {
            explainMd:
              'Assignment binds another name to the same object; nothing is duplicated. `a` and `b` are two labels on one list, so an append through `b` is an append the `a` name can see. `b = a.copy()` is the line that would have made two lists.'
          }
        ),
        check(
          'which-copies',
          'Which line leaves `a` alone when you later append to the result?',
          [
            { id: 'alias', md: '`b = a`', misconceptionId: 'assignment-copies-a-list' },
            { id: 'slice', md: '`b = a[:]`' },
            { id: 'item', md: '`b = a[0]`' }
          ],
          'slice',
          {
            explainMd:
              'A full slice `a[:]` builds a new list holding the same items, so appending to `b` cannot reach `a`. `b = a` shares one list, and `b = a[0]` is not a list at all — it is the first item. `a.copy()` and `list(a)` are the other two ways to say `a[:]`.'
          }
        ),
        pyCode({
          id: 'copy-before-append',
          prompt:
            '> Write `add_reading(log, value)` so it returns a **new** list with `value` on the end and leaves `log` unchanged. The starter prints the result and the original on one line; both should not be the same.',
          equals: '[12, 7, 19] [12, 7]',
          hidden: true,
          hints: ladder(
            'Run the starter and read the two lists it prints. They are identical, which means the function edited the list the caller still holds.',
            'Build a second list first — `list(log)`, `log.copy()`, or `log[:]` — then append to that one and return it. The name the caller passed in never gets an `append` call.',
            'For `def with_zero(xs): fresh = list(xs); fresh.append(0); return fresh`, calling `with_zero([1])` gives `[1, 0]` and the argument is still `[1]`.',
            `def add_reading(log, value):
    fresh = list(log)
    fresh.append(value)
    return fresh


base = [12, 7]
print(add_reading(base, 19), base)`
          )
        })
      ]
    }),
    files: {
      'main.py': `def add_reading(log, value):
    fresh = log
    fresh.append(value)
    return fresh


base = [12, 7]
print(add_reading(base, 19), base)
`,
      'hidden_test.py': importAssert(`base = [1, 2]
grown = main.add_reading(base, 3)
assert grown == [1, 2, 3]
assert base == [1, 2], "the list you were given must not change"
assert grown is not base, "return a new list, not the same one"
assert main.add_reading([], 5) == [5]`)
    }
  })

  out.push({
    doc: lesson({
      id: 'tuples-and-unpacking',
      courseId: 'collections',
      moduleId: 'sequences',
      title: 'A pair that cannot wobble',
      skillIds: ['python.collections.list'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Fixed shape, fixed size',
          idea:
            'A tuple is a small group of values written with commas, usually inside round brackets. Once built it cannot be changed: no append, no item assignment. That sounds like a limitation, but it is a promise — a tuple of two numbers stays a tuple of two numbers for as long as anyone holds it.',
          bites:
            'This bites when a function returns a list of two things and a caller quietly appends a third. Nothing raises, and the bug shows up three layers away. It also bites when you unpack the wrong number of names: `x, y = (1, 2, 3)` raises `ValueError` instead of silently dropping a value, which is the tuple keeping its promise.',
          code: `here = (3, 2)
x, y = here            # unpacking: one name per slot
print(x, y)            # 3 2

x, y = y, x            # swap, with no temporary name
print(x, y)            # 2 3

# here[0] = 9 would raise TypeError: tuples do not change`,
          mistake:
            'A common mistake is treating a tuple as a slower list and reaching for `.append`. If the size can grow, you wanted a list all along. The exercise asks for `move(pos, dx, dy)` where `pos` is an `(x, y)` pair: unpack it, do the arithmetic, and hand back a fresh pair rather than editing the one you were given.'
        }),
        predict(
          'swap-result',
          'After `x, y = 3, 2` and then `x, y = y, x`, what does `print(x, y)` show?',
          [
            { id: 'same', md: '`3 2`' },
            { id: 'swapped', md: '`2 3`' }
          ],
          'swapped',
          {
            explainMd:
              'The right-hand side is evaluated first, into the pair `(2, 3)`, and only then unpacked into the names on the left. Because the old values are already captured before any name is rebound, no temporary variable is needed and nothing is lost.'
          }
        ),
        tf(
          'tuple-immutable',
          '`here = (3, 2)` followed by `here[0] = 9` raises `TypeError`.',
          true,
          {
            explainMd:
              'Tuples do not support item assignment, so Python raises `TypeError: tuple object does not support item assignment`. To get a different pair you build a new one, which is exactly why a tuple is safe to hand out — nobody can edit it behind your back.'
          }
        ),
        pyCode({
          id: 'move-a-pair',
          prompt:
            '> Write `move(pos, dx, dy)` where `pos` is an `(x, y)` tuple. Unpack it, add the offsets, and return a **new tuple**. Print `move((3, 2), 1, -1)`.',
          equals: '(4, 1)',
          hidden: true,
          hints: ladder(
            'The starter hands back the pair it was given, so the fox never actually moves. The two numbers inside `pos` have to come out before you can add anything to them.',
            'Unpack with `x, y = pos`, then build the answer with `return (x + dx, y + dy)`. A tuple cannot be edited in place, so building a new one is the only option — and the right one.',
            'For `def grow(size, by): w, h = size; return (w + by, h + by)`, calling `grow((2, 5), 1)` gives `(3, 6)`.',
            `def move(pos, dx, dy):
    x, y = pos
    return (x + dx, y + dy)


print(move((3, 2), 1, -1))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def move(pos, dx, dy):
    return pos


print(move((3, 2), 1, -1))
`,
      'hidden_test.py': importAssert(`assert main.move((3, 2), 1, -1) == (4, 1)
assert main.move((0, 0), 0, 0) == (0, 0)
assert main.move((5, 5), -5, 2) == (0, 7)
assert isinstance(main.move((1, 1), 2, 2), tuple), "return a tuple, not a list"

start = (5, 5)
main.move(start, 1, 1)
assert start == (5, 5)`)
    }
  })

  out.push({
    doc: lesson({
      id: 'sorting-with-key',
      courseId: 'collections',
      moduleId: 'sequences',
      title: 'Sorted gives, sort rearranges',
      skillIds: ['python.collections.list'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'Two different jobs',
          idea:
            'Python has two ways to order a list and they are not interchangeable. `sorted(items)` builds and returns a new list, leaving the original alone. `items.sort()` rearranges the list in place and returns `None`, because there is nothing new to hand back.',
          bites:
            'This bites the moment you write `best = readings.sort()`. The list really does get sorted, so the code looks like it worked, but `best` is `None` and the next line fails somewhere else entirely. The traceback points at the innocent line, not at the assignment that caused it.',
          code: `readings = [12, 7, 19]
print(sorted(readings))                 # [7, 12, 19] - a new list
print(readings)                         # [12, 7, 19] - untouched

names = ["Owl", "fox", "Badger"]
print(sorted(names, key=str.lower))     # ['Badger', 'fox', 'Owl']
print(sorted(readings, reverse=True))   # [19, 12, 7]
print(readings.sort())                  # None`,
          mistake:
            'A common mistake is passing the comparison you want instead of the value to compare: `key=` takes a function that is called once per item and returns the thing to order by. The exercise asks you to order station records, each a `(name, strength)` pair, from strongest to weakest without disturbing the list you were handed.'
        }),
        predict(
          'sort-return',
          '`readings = [3, 1]`, then `best = readings.sort()`. What is `best`?',
          [
            { id: 'list', md: '`[1, 3]` — the sorted list', misconceptionId: 'sort-returns-a-list' },
            { id: 'none', md: '`None`' }
          ],
          'none',
          {
            explainMd:
              '`list.sort()` changes the list in place and returns `None`, which is what Python methods return when their whole point is the side effect. `readings` really is `[1, 3]` afterwards; it is `best` that is empty. Use `best = sorted(readings)` when you want a value back.'
          }
        ),
        check(
          'key-does-what',
          '`sorted(words, key=len)` orders the words by…',
          [
            { id: 'alpha', md: 'Alphabetical order' },
            { id: 'length', md: 'How many characters each word has' },
            { id: 'reverse', md: 'Reverse alphabetical order' }
          ],
          'length',
          {
            explainMd:
              '`key` names a function that is called once for every item; the value it returns is what gets compared. With `key=len`, Python compares the lengths but still moves the original words around, so you get the words back — just ordered by size.'
          }
        ),
        pyCode({
          id: 'strongest-first',
          prompt:
            '> Write `by_strength(rows)` where each row is a `(name, strength)` tuple. Return a **new** list ordered strongest first, leaving `rows` alone.',
          equals: "[('creek', 19), ('bluff', 12), ('ridge', 7)]",
          hidden: true,
          hints: ladder(
            'The starter sorts, but it compares whole tuples, so it orders by name and ignores the number entirely. Decide which part of each row should be compared.',
            'Give `sorted` a `key=` function that pulls the second slot out of a row, and pass `reverse=True` to run largest first. `sorted` returns a new list, which is exactly what the task asks for.',
            'For `sorted([("a", 2), ("b", 9)], key=lambda row: row[1], reverse=True)` the result is `[("b", 9), ("a", 2)]`.',
            `def by_strength(rows):
    return sorted(rows, key=lambda row: row[1], reverse=True)


print(by_strength([("ridge", 7), ("creek", 19), ("bluff", 12)]))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def by_strength(rows):
    return sorted(rows)


print(by_strength([("ridge", 7), ("creek", 19), ("bluff", 12)]))
`,
      'hidden_test.py': importAssert(`rows = [("ridge", 7), ("creek", 19), ("bluff", 12)]
assert main.by_strength(rows) == [("creek", 19), ("bluff", 12), ("ridge", 7)]
assert rows == [("ridge", 7), ("creek", 19), ("bluff", 12)], "sorted() should leave the original alone"
assert main.by_strength([]) == []
assert main.by_strength([("solo", 1)]) == [("solo", 1)]`)
    }
  })

  // ----------------------------------------------------------------- mappings

  out.push({
    doc: lesson({
      id: 'dicts-keys',
      courseId: 'collections',
      moduleId: 'mappings',
      title: 'Look it up by name',
      skillIds: ['python.collections.dict'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'A shelf with labels instead of numbers',
          idea:
            'A dictionary stores values under names you choose rather than positions Python chose. `station["fox"]` reads the value filed under `"fox"`, and `station["badger"] = 5` files a new one. The name is called the key, and looking one up does not depend on how many keys there are.',
          bites:
            'This bites when you loop over a dictionary expecting the values. A plain `for name in station:` walks the **keys**, so the body sees `"fox"`, not `3`. Summing that loop gives you a count of names instead of a total of sightings, and nothing raises to tell you.',
          code: `station = {"fox": 3, "owl": 1}
print(station["fox"])          # 3
station["badger"] = 5          # a new key, filed on the spot

for name in station:           # keys
    print(name, station[name])

print(list(station.values()))  # [3, 1, 5]
print(list(station.items()))   # [('fox', 3), ('owl', 1), ('badger', 5)]`,
          mistake:
            'A common mistake is assuming a dictionary needs its keys declared up front. Assigning to a key that does not exist creates it; assigning to one that does replaces the value. The exercise asks you to total the sightings and list the names seen, so you have to reach both the keys and the values of the same dictionary.'
        }),
        check(
          'iterate-default',
          'A plain `for name in station:` loop walks the…',
          [
            { id: 'keys', md: 'Keys' },
            { id: 'values', md: 'Values' },
            { id: 'pairs', md: 'Key and value together, as a pair' }
          ],
          'keys',
          {
            explainMd:
              'Iterating a dictionary hands you its keys, which is why `station[name]` inside the loop is how you reach the value. If you want both at once, ask for them: `for name, count in station.items():` unpacks each pair into two names.'
          }
        ),
        tf(
          'insert-by-assign',
          '`station["badger"] = 5` adds the key when it is not already there.',
          true,
          {
            explainMd:
              'Assignment to a key either creates it or replaces its value — there is no separate insert step. That is different from reading: `station["badger"]` on a key that does not exist raises `KeyError` rather than quietly creating it.'
          }
        ),
        pyCode({
          id: 'total-sightings',
          prompt:
            '> Write `total_sightings(counts)` returning the sum of every value, and `names_seen(counts)` returning the keys as a sorted list. Print `total_sightings({"fox": 3, "owl": 1, "badger": 5})`.',
          equals: '9',
          hidden: true,
          hints: ladder(
            'The starter prints `3`, which is the number of keys, not the number of sightings. The loop is walking names and counting them.',
            'Inside the loop the name is the key; the value is `counts[name]`. Add that value to the running total instead of adding one. For the second function, `sorted(counts)` already sorts the keys.',
            'For `{"a": 2, "b": 4}`, adding `counts[name]` each time gives `6`, while adding `1` each time gives `2`.',
            `def total_sightings(counts):
    total = 0
    for name in counts:
        total += counts[name]
    return total


def names_seen(counts):
    return sorted(counts)


print(total_sightings({"fox": 3, "owl": 1, "badger": 5}))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def total_sightings(counts):
    total = 0
    for name in counts:
        total += 1
    return total


def names_seen(counts):
    return []


print(total_sightings({"fox": 3, "owl": 1, "badger": 5}))
`,
      'hidden_test.py': importAssert(`assert main.total_sightings({"fox": 3, "owl": 1, "badger": 5}) == 9
assert main.total_sightings({}) == 0
assert main.total_sightings({"fox": 2}) == 2
assert main.names_seen({"owl": 1, "fox": 3}) == ["fox", "owl"]
assert main.names_seen({}) == []`)
    }
  })

  out.push({
    doc: lesson({
      id: 'dict-get-and-setdefault',
      courseId: 'collections',
      moduleId: 'mappings',
      title: 'Missing keys, handled on purpose',
      skillIds: ['python.collections.dict'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'Three answers to "what if it is not there"',
          idea:
            'Square brackets are strict: `counts["owl"]` on a key that was never filed raises `KeyError` and stops the program. `.get("owl")` is forgiving: it returns `None`, or whatever default you name as a second argument. `.setdefault("owl", [])` is constructive: it files the default first if needed, then returns whatever is now stored.',
          bites:
            'This bites when you are building groups. Writing `groups[zone].append(name)` works for the second record in a zone and raises on the first, because nothing has filed an empty list yet. `setdefault` collapses that whole "is it there yet" dance into one line that is right both times.',
          code: `counts = {"fox": 3}
print(counts.get("owl"))        # None
print(counts.get("owl", 0))     # 0
print(counts.get("fox", 0))     # 3
# counts["owl"] would raise KeyError

groups = {}
groups.setdefault("north", []).append("fox")
groups.setdefault("north", []).append("owl")
print(groups)                   # {'north': ['fox', 'owl']}`,
          mistake:
            'A common mistake is using `.get()` everywhere, including where a missing key really is a bug — a silent `None` is harder to chase than a loud `KeyError`. The exercise asks for a reading lookup that falls back to zero, and a grouping function that files each name under its zone without ever checking whether the zone exists yet.'
        }),
        predict(
          'missing-bracket',
          'What does `{"fox": 3}["owl"]` do?',
          [
            { id: 'none', md: 'Returns `None`', misconceptionId: 'missing-key-returns-none' },
            { id: 'raises', md: 'Raises `KeyError`' }
          ],
          'raises',
          {
            explainMd:
              'Square brackets on a missing key raise `KeyError` and stop the program right there. The method that returns `None` instead is `.get()`, and `.get("owl", 0)` returns `0`. Choosing between them is choosing whether a missing key is a bug or an expected case.'
          }
        ),
        check(
          'setdefault-returns',
          '`groups.setdefault("north", [])` returns…',
          [
            { id: 'value', md: 'The value now stored under `"north"` — the existing one, or the new empty list' },
            { id: 'none', md: '`None`' },
            { id: 'dict', md: 'The whole dictionary' }
          ],
          'value',
          {
            explainMd:
              '`setdefault` returns the value you can work with, which is why `groups.setdefault(zone, []).append(name)` reads as one move. If the key was already there the default is ignored entirely and the existing list comes back, so nothing you collected earlier is lost.'
          }
        ),
        pyCode({
          id: 'defaults-and-groups',
          prompt:
            '> Write `reading_for(counts, name)` returning the stored value or `0` when the key is missing, and `group_by_zone(records)` turning `(name, zone)` pairs into `{zone: [names]}`. Print `reading_for({"fox": 3}, "owl")`.',
          equals: '0',
          hidden: true,
          hints: ladder(
            'The starter answers `None` for a missing name, and its grouping function throws away every record after the first one in each zone.',
            '`counts.get(name, 0)` is the whole first function. For the second, `groups.setdefault(zone, []).append(name)` appends to the list that is already there, or to a fresh one it just filed.',
            'Starting from `{}`, running `groups.setdefault("a", []).append(1)` twice leaves `{"a": [1, 1]}` — the second call reuses the list the first one created.',
            `def reading_for(counts, name):
    return counts.get(name, 0)


def group_by_zone(records):
    groups = {}
    for name, zone in records:
        groups.setdefault(zone, []).append(name)
    return groups


print(reading_for({"fox": 3}, "owl"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def reading_for(counts, name):
    if name in counts:
        return counts[name]
    return None


def group_by_zone(records):
    groups = {}
    for name, zone in records:
        groups[zone] = [name]
    return groups


print(reading_for({"fox": 3}, "owl"))
`,
      'hidden_test.py': importAssert(`assert main.reading_for({"fox": 3}, "fox") == 3
assert main.reading_for({"fox": 3}, "owl") == 0
assert main.reading_for({}, "anything") == 0

rows = [("fox", "north"), ("owl", "north"), ("badger", "south")]
assert main.group_by_zone(rows) == {"north": ["fox", "owl"], "south": ["badger"]}
assert main.group_by_zone([]) == {}`)
    }
  })

  out.push({
    doc: lesson({
      id: 'sets-and-dedupe',
      courseId: 'collections',
      moduleId: 'mappings',
      title: 'Membership without duplicates',
      skillIds: ['python.collections.set'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'A bag that refuses seconds',
          idea:
            'A set holds each value at most once and answers one question very fast: is this in here? Adding a value that is already present changes nothing, which is why `set(names)` is the shortest way to collapse a list of repeated sightings down to the distinct ones.',
          bites:
            'This bites when you print a set and trust what you see. A set has no position and no insertion order you may rely on; the display order comes from how values happen to hash. Code that passes today because `{"fox", "owl"}` printed in a friendly order can fail on another machine or another run.',
          code: `seen = {"fox", "owl", "fox"}
print(len(seen))                  # 2 - the duplicate collapsed
print("fox" in seen)              # True

morning = {"fox", "owl"}
evening = {"owl", "badger"}
print(sorted(morning & evening))  # ['owl']        - in both
print(sorted(morning | evening))  # ['badger', 'fox', 'owl'] - in either
print(sorted(morning - evening))  # ['fox']        - only in the first`,
          mistake:
            'A common mistake is sorting once and then treating the set itself as ordered afterwards. Sorting produces a **list**; the set is unchanged. The exercise asks for two functions that both end in `sorted(...)`, so the caller gets a stable answer no matter how the set chose to arrange itself.'
        }),
        predict(
          'set-order',
          'You add `"fox"`, then `"owl"`, then `"badger"` to a set. What order do they come out in?',
          [
            { id: 'insertion', md: 'The order you added them', misconceptionId: 'sets-keep-order' },
            { id: 'unordered', md: 'No order you are allowed to rely on' }
          ],
          'unordered',
          {
            explainMd:
              'Sets are unordered: they are built for membership tests, not for sequence. Any order you observe is an accident of hashing and may change between values, runs, or Python versions. When order matters, wrap the set in `sorted(...)` and work with the list that comes back.'
          }
        ),
        check(
          'set-ops',
          'What is `{1, 2, 3} & {2, 3, 4}`?',
          [
            { id: 'union', md: '`{1, 2, 3, 4}`' },
            { id: 'inter', md: '`{2, 3}`' },
            { id: 'diff', md: '`{1}`' }
          ],
          'inter',
          {
            explainMd:
              '`&` is intersection: the values present in both sets. `|` is union, everything from either side, and `-` is difference, what is in the left set and not the right. Reaching for these beats writing a nested loop that compares every pair.'
          }
        ),
        pyCode({
          id: 'dedupe-and-overlap',
          prompt:
            '> Write `unique_sorted(names)` returning the distinct names in sorted order, and `both_shifts(morning, evening)` returning the sorted names that appear in both lists.',
          equals: "['badger', 'fox', 'owl']",
          hidden: true,
          hints: ladder(
            'The starter sorts the names but keeps every repeat, so `fox` appears twice. Something has to collapse the duplicates before the sort.',
            '`set(names)` throws away repeats, and `sorted(...)` turns the set back into a list with a dependable order. For the overlap, build a set from each list and use `&`.',
            '`sorted(set(["b", "a", "b"]))` is `["a", "b"]`, and `sorted({"a", "b"} & {"b", "c"})` is `["b"]`.',
            `def unique_sorted(names):
    return sorted(set(names))


def both_shifts(morning, evening):
    return sorted(set(morning) & set(evening))


print(unique_sorted(["fox", "owl", "fox", "badger"]))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def unique_sorted(names):
    return sorted(names)


def both_shifts(morning, evening):
    return sorted(morning)


print(unique_sorted(["fox", "owl", "fox", "badger"]))
`,
      'hidden_test.py': importAssert(`assert main.unique_sorted(["fox", "owl", "fox"]) == ["fox", "owl"]
assert main.unique_sorted([]) == []
assert main.unique_sorted(["owl"]) == ["owl"]
assert main.both_shifts(["fox", "owl"], ["owl", "badger"]) == ["owl"]
assert main.both_shifts(["fox"], ["owl"]) == []
assert main.both_shifts(["fox", "fox", "owl"], ["fox", "owl"]) == ["fox", "owl"]`)
    }
  })

  out.push({
    doc: lesson({
      id: 'counting-with-counter',
      courseId: 'collections',
      moduleId: 'mappings',
      title: 'Counting, done for you',
      skillIds: ['python.collections.dict'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'The tally you keep writing',
          idea:
            'Counting how often each value appears is such a common job that the standard library ships it. `Counter(names)` walks the sequence once and hands back a dictionary-like tally, and `most_common(n)` gives the top `n` as `(value, count)` pairs already ordered highest first.',
          bites:
            'This bites when you hand-roll the same loop and forget the first-time case. `counts[name] = counts[name] + 1` raises `KeyError` the first time it meets a name. A `Counter` treats an unseen key as zero instead of raising, so the tally never needs a special case.',
          code: `from collections import Counter

tally = Counter(["fox", "owl", "fox", "fox", "owl", "badger"])
print(tally["fox"])           # 3
print(tally["stoat"])         # 0 - unseen counts as zero, no KeyError
print(tally.most_common(2))   # [('fox', 3), ('owl', 2)]
print(sorted(tally))          # ['badger', 'fox', 'owl']`,
          mistake:
            'A common mistake is reading `tally["stoat"] == 0` as "the key exists with value zero". It does not exist; the `Counter` just answers zero. Use `"stoat" in tally` when you need to know. The exercise asks for a `top_species(names, n)` that reports the busiest species with their counts, in one short function.'
        }),
        check(
          'counter-missing',
          'On a `Counter`, what does `tally["stoat"]` give when `stoat` was never counted?',
          [
            { id: 'zero', md: '`0`' },
            { id: 'keyerror', md: 'A `KeyError`' },
            { id: 'none', md: '`None`' }
          ],
          'zero',
          {
            explainMd:
              'A `Counter` answers zero for anything it has not seen, which is what makes it safe to add to without checking first. A plain dictionary would raise `KeyError` on the same line — that difference is the whole reason `Counter` exists.'
          }
        ),
        tf(
          'most-common-order',
          '`most_common()` lists the highest count first.',
          true,
          {
            explainMd:
              '`most_common()` sorts by count, descending, and `most_common(n)` stops after `n` entries. Each entry is a `(value, count)` tuple, so you can unpack it in a loop with `for name, count in tally.most_common(3):` and print both halves.'
          }
        ),
        pyCode({
          id: 'top-species',
          prompt:
            '> Write `top_species(names, n)` returning the `n` most common names as `(name, count)` pairs, busiest first. Print `top_species([...], 2)` for the sample list in the starter.',
          equals: "[('fox', 3), ('owl', 2)]",
          hidden: true,
          hints: ladder(
            'The starter lists distinct names alphabetically and drops the counts entirely, so nothing in its answer says how busy anything was.',
            'Build a `Counter` from the list and ask it for `most_common(n)`. That one call does the tallying and the ordering, and it already returns pairs in the shape the task wants.',
            '`Counter(["a", "b", "a"]).most_common(1)` is `[("a", 2)]`.',
            `from collections import Counter


def top_species(names, n):
    return Counter(names).most_common(n)


print(top_species(["fox", "owl", "fox", "fox", "owl", "badger"], 2))`
          )
        })
      ]
    }),
    files: {
      'main.py': `from collections import Counter


def top_species(names, n):
    return sorted(set(names))[:n]


print(top_species(["fox", "owl", "fox", "fox", "owl", "badger"], 2))
`,
      'hidden_test.py': importAssert(`rows = ["fox", "owl", "fox", "fox", "owl", "badger"]
assert main.top_species(rows, 2) == [("fox", 3), ("owl", 2)]
assert main.top_species(rows, 1) == [("fox", 3)]
assert main.top_species([], 3) == []
assert main.top_species(["solo"], 2) == [("solo", 1)]`)
    }
  })

  // -------------------------------------------------------------------- shape

  out.push({
    doc: lesson({
      id: 'comprehensions-list',
      courseId: 'collections',
      moduleId: 'shape',
      title: 'The loop that is an expression',
      skillIds: ['python.collections.comprehension'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Build the list, do not grow it',
          idea:
            'A list comprehension writes "make a new list out of these items" as a single expression. `[f(x) for x in xs if p(x)]` reads left to right as: keep every `x` in `xs` that passes `p`, and put `f(x)` in the result. It replaces the three-line pattern of create-empty-list, loop, append.',
          bites:
            'This bites when the comprehension starts doing more than shaping. A comprehension that also prints, writes a file, or updates a counter is a loop wearing a costume, and it is harder to read than the loop was. Reach for a comprehension when the only product is the new list.',
          code: `readings = [12, 7, 19, 3, 22]

strong = []
for value in readings:
    if value > 10:
        strong.append(value)
print(strong)                                 # [12, 19, 22]

print([value for value in readings if value > 10])   # the same list
print([value * 2 for value in readings])             # [24, 14, 38, 6, 44]`,
          mistake:
            'A common mistake is putting the condition in the wrong place: the `if` at the end filters items out, while an `if ... else` before the `for` chooses between two values and keeps every item. The exercise asks for labelled readings above a threshold, so the filtering `if` is the one you want.'
        }),
        check(
          'comp-order',
          'In `[f(x) for x in xs if p(x)]`, what happens to an item where `p(x)` is `False`?',
          [
            { id: 'kept', md: '`f(x)` still runs and the result is kept' },
            { id: 'skipped', md: 'It is skipped, so nothing is added for it' },
            { id: 'none', md: '`None` is added in its place' }
          ],
          'skipped',
          {
            explainMd:
              'The trailing `if` is a filter: items that fail it never reach the expression on the left, and nothing is appended for them. That is why the result can be shorter than the input, and why `[v for v in xs if False]` is an empty list rather than a list of `None`.'
          }
        ),
        predict(
          'comp-result',
          'What is `[v * 10 for v in [1, 2, 3] if v != 2]`?',
          [
            { id: 'three', md: '`[10, 20, 30]`' },
            { id: 'two', md: '`[10, 30]`' }
          ],
          'two',
          {
            explainMd:
              'The filter drops the `2` before the multiplication ever happens, so only `1` and `3` reach `v * 10`. Two items in, two items out — the length of a filtered comprehension follows the filter, not the input.'
          }
        ),
        pyCode({
          id: 'label-strong',
          prompt:
            '> Write `labels(readings)` returning `"<value> mV"` for every reading **above 10**, using a list comprehension rather than an append loop.',
          equals: "['12 mV', '19 mV', '22 mV']",
          hidden: true,
          hints: ladder(
            'The starter labels every reading, including the quiet ones. The shape is right; the comprehension is missing its filter.',
            'A filter goes at the end, after the `for` clause: `[expr for item in items if condition]`. Only items where the condition is true reach `expr`.',
            '`[n for n in [1, 5, 9] if n > 4]` is `[5, 9]` — the `1` never reaches the expression on the left.',
            `def labels(readings):
    return [f"{value} mV" for value in readings if value > 10]


print(labels([12, 7, 19, 3, 22]))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def labels(readings):
    return [f"{value} mV" for value in readings]


print(labels([12, 7, 19, 3, 22]))
`,
      'hidden_test.py': `import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert ".append(" not in src, "build the list with a comprehension, not an append loop"

assert main.labels([12, 7, 19, 3, 22]) == ["12 mV", "19 mV", "22 mV"]
assert main.labels([1, 2]) == []
assert main.labels([]) == []
assert main.labels([11]) == ["11 mV"]
assert main.labels([10]) == [], "the threshold is above 10, not 10 or more"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'comprehensions-dict-set',
      courseId: 'collections',
      moduleId: 'shape',
      title: 'Comprehensions that are not lists',
      skillIds: ['python.collections.comprehension'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'The braces decide',
          idea:
            'The same comprehension grammar builds dictionaries and sets; only the brackets and the expression change. Square brackets give a list. Braces holding `key: value` give a dictionary. Braces holding a single expression give a set, with duplicates collapsed on the way in.',
          bites:
            'This bites when you invert a mapping. `{value: key for key, value in m.items()}` is one clean line, but if two keys shared a value, only the last one survives — the earlier pair is overwritten without a word. A zone map with two sensors reading 12 quietly loses a sensor.',
          code: `readings = {"north": 12, "east": 7, "south": 19}

loud = {zone: value for zone, value in readings.items() if value > 10}
print(loud)                                 # {'north': 12, 'south': 19}

by_value = {value: zone for zone, value in readings.items()}
print(by_value[12])                         # north

print(sorted({len(zone) for zone in readings}))   # [4, 5] - a set of lengths`,
          mistake:
            'A common mistake is writing `{zone for zone, value in ...}` when you meant a dictionary, and getting a set of keys instead. The colon is what makes it a mapping. The exercise asks you to invert a mapping and to filter one, so you will write both shapes side by side and see the difference in the braces.'
        }),
        check(
          'invert-risk',
          'Inverting a mapping with `{value: key for key, value in m.items()}` loses data when…',
          [
            { id: 'dupes', md: 'Two keys share the same value' },
            { id: 'strings', md: 'The keys are strings' },
            { id: 'empty', md: 'The mapping is empty' }
          ],
          'dupes',
          {
            explainMd:
              'The inverted mapping files each old value as a new key, and a key can only hold one value. When two original keys shared a value, the second one overwrites the first and the result is shorter than the input — with no error to warn you.'
          }
        ),
        tf(
          'set-comp-braces',
          '`{f(x) for x in xs}` builds a set, while adding `key: value` inside the same braces builds a dictionary.',
          true,
          {
            explainMd:
              'Braces are shared between sets and dictionaries; the colon in the expression is what tells them apart. One oddity worth remembering: `{}` on its own is an empty dictionary, so an empty set has to be written `set()`.'
          }
        ),
        pyCode({
          id: 'invert-and-filter',
          prompt:
            '> Write `invert(mapping)` returning a dictionary with keys and values swapped, and `zones_over(readings, limit)` returning only the pairs whose value is greater than `limit`. Print `invert({"north": 12, "east": 7})`.',
          equals: "{12: 'north', 7: 'east'}",
          hidden: true,
          hints: ladder(
            'Both starter functions hand the mapping straight back, so the printed dictionary still has zone names as keys.',
            '`mapping.items()` yields `(key, value)` pairs you can unpack in the comprehension header. Write the swapped pair as `{value: key for key, value in mapping.items()}`, and for the filter keep the pair as it is and add a trailing `if`.',
            '`{v: k for k, v in {"a": 1}.items()}` is `{1: "a"}`, and `{k: v for k, v in {"a": 1, "b": 9}.items() if v > 5}` is `{"b": 9}`.',
            `def invert(mapping):
    return {value: key for key, value in mapping.items()}


def zones_over(readings, limit):
    return {zone: value for zone, value in readings.items() if value > limit}


print(invert({"north": 12, "east": 7}))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def invert(mapping):
    return mapping


def zones_over(readings, limit):
    return readings


print(invert({"north": 12, "east": 7}))
`,
      'hidden_test.py': importAssert(`assert main.invert({"north": 12, "east": 7}) == {12: "north", 7: "east"}
assert main.invert({}) == {}
assert main.zones_over({"north": 12, "east": 7, "south": 19}, 10) == {"north": 12, "south": 19}
assert main.zones_over({"east": 7}, 10) == {}
assert main.zones_over({}, 0) == {}`)
    }
  })

  out.push({
    doc: lesson({
      id: 'zip-and-enumerate',
      courseId: 'collections',
      moduleId: 'shape',
      title: 'Positions and parallel lists',
      skillIds: ['python.collections.list'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Two helpers that end index arithmetic',
          idea:
            '`enumerate(items)` yields `(index, item)` pairs, so a loop can know where it is without keeping a counter by hand. `zip(a, b)` yields pairs taken from two sequences at the same position, so two parallel lists can be walked together instead of one being indexed through the other.',
          bites:
            'This bites when the two sequences are different lengths. `zip` stops as soon as the shortest one runs out and says nothing about the leftovers, so a zone list of three and a reading list of two quietly produces two pairs. If the mismatch is a bug, `zip` will not be the one to report it.',
          code: `zones = ["north", "east", "south"]
readings = [12, 7]

for index, zone in enumerate(zones):
    print(index, zone)              # 0 north / 1 east / 2 south

print(list(zip(zones, readings)))   # [('north', 12), ('east', 7)] - stops short
print(list(enumerate(zones, start=1)))   # numbering for humans, from 1`,
          mistake:
            'A common mistake is writing `for i in range(len(zones)):` and then indexing everything inside the loop. It works, but every access is a chance to use the wrong list or slip by one. The exercise asks for a numbered list of zones starting at 1, and a paired-up list of zones and readings, so both helpers get used for what they are for.'
        }),
        predict(
          'zip-length',
          '`zones` has three items and `readings` has two. How many pairs does `list(zip(zones, readings))` produce?',
          [
            { id: 'three', md: 'Three — the extra zone pairs with `None`' },
            { id: 'two', md: 'Two — `zip` stops at the shorter sequence' }
          ],
          'two',
          {
            explainMd:
              '`zip` stops the moment any input is exhausted, so the length of the result is the length of the shortest input. Nothing is padded and nothing is reported. When the leftovers matter, compare the lengths yourself first or reach for `itertools.zip_longest`.'
          }
        ),
        check(
          'enumerate-gives',
          'In `for i, item in enumerate(xs):`, what is `i`?',
          [
            { id: 'index', md: 'The position of the item, counting from 0' },
            { id: 'item', md: 'A copy of the item' },
            { id: 'len', md: 'How many items are left' }
          ],
          'index',
          {
            explainMd:
              '`enumerate` yields a `(position, item)` pair on every step, so the first name gets the index and the second gets the value. Passing `start=1` changes where the numbering begins without changing the items, which is handy when the output is for a person to read.'
          }
        ),
        pyCode({
          id: 'number-and-pair',
          prompt:
            '> Write `numbered(zones)` returning strings like `"1: north"` numbered from **1**, and `pair_up(zones, readings)` returning a list of `(zone, reading)` tuples. Print `numbered(["north", "east"])`.',
          equals: "['1: north', '2: east']",
          hidden: true,
          hints: ladder(
            'Every line the starter produces begins with `0:`, because nothing in the loop knows which position it is on.',
            '`enumerate(zones, start=1)` hands you the number and the zone together on each step. Unpack both names in the comprehension header. For the second function, `list(zip(...))` turns the pairs into a list.',
            '`[f"{n}. {w}" for n, w in enumerate(["a", "b"], start=1)]` is `["1. a", "2. b"]`.',
            `def numbered(zones):
    return [f"{index}: {zone}" for index, zone in enumerate(zones, start=1)]


def pair_up(zones, readings):
    return list(zip(zones, readings))


print(numbered(["north", "east"]))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def numbered(zones):
    return [f"0: {zone}" for zone in zones]


def pair_up(zones, readings):
    return []


print(numbered(["north", "east"]))
`,
      'hidden_test.py': importAssert(`assert main.numbered(["north", "east"]) == ["1: north", "2: east"]
assert main.numbered([]) == []
assert main.numbered(["solo"]) == ["1: solo"]
assert main.pair_up(["north", "east", "south"], [12, 7]) == [("north", 12), ("east", 7)]
assert main.pair_up([], [1, 2]) == []
assert main.pair_up(["a", "b"], [1, 2]) == [("a", 1), ("b", 2)]`)
    }
  })

  out.push({
    doc: lesson({
      id: 'nested-data-gradebook',
      courseId: 'collections',
      moduleId: 'shape',
      title: 'The station gradebook',
      skillIds: ['python.collections.dict'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'A list of dictionaries is one row each',
          idea:
            'Real records almost never arrive as one flat list. The station gradebook is a **list** whose items are **dictionaries**, and one of those dictionary values is itself a list of scores. Each level is read with the tool for that level: a number for the list, a key for the dictionary.',
          bites:
            'This bites when you mix the two up. `gradebook["fox"]` looks reasonable and raises `TypeError`, because the outer thing is a list and lists are indexed by position. The key only works one level in: `gradebook[0]["name"]` reads the name of the first row.',
          code: `gradebook = [
    {"name": "fox", "zone": "north", "scores": [8, 9]},
    {"name": "owl", "zone": "south", "scores": [6]},
]

for row in gradebook:
    print(row["name"], sum(row["scores"]))   # fox 17 / owl 6

print(gradebook[0]["scores"][1])             # 9
print(len(gradebook))                        # 2 rows`,
          mistake:
            'A common mistake is summarising with the wrong denominator: dividing every total by the same number instead of by that row\'s own score count. The exercise asks for an average per name and then the best name, so each row has to be measured against its own list of scores.'
        }),
        check(
          'reach-in',
          'In the gradebook above, what does `gradebook[1]["scores"][0]` read?',
          [
            { id: 'first', md: 'The first score of the second row' },
            { id: 'second', md: 'The second score of the first row' },
            { id: 'error', md: 'Nothing — that is a `TypeError`' }
          ],
          'first',
          {
            explainMd:
              'Read it left to right: `[1]` picks the second row of the outer list, `["scores"]` pulls the score list out of that dictionary, and `[0]` takes its first entry. Each step is one level deeper, and each uses the access style that level supports.'
          }
        ),
        tf(
          'row-is-dict',
          'Each item in a list of dictionaries is itself a dictionary, so you reach inside it by key rather than by number.',
          true,
          {
            explainMd:
              'The outer container is indexed by position and the inner one by key. Getting this the wrong way round is the most common error in nested data, and the traceback usually says `TypeError: list indices must be integers` or `KeyError`, which tells you which level you were on.'
          }
        ),
        pyCode({
          id: 'gradebook-summary',
          prompt:
            '> Write `averages(gradebook)` returning `{name: average}` rounded to one decimal, and `best(gradebook)` returning the name with the highest average. Print `best(...)` for the two rows in the starter.',
          equals: 'owl',
          hidden: true,
          hints: ladder(
            'The starter always names the first row, so it would be right by luck and wrong as soon as the rows are in a different order.',
            'Walk the rows once. For each, the average is `sum(row["scores"]) / len(row["scores"])`, rounded with `round(value, 1)`. Once you have that mapping, `max(mapping, key=mapping.get)` names the winner.',
            'For `{"a": 3.0, "b": 9.0}`, `max(scores, key=scores.get)` is `"b"` — `max` compares the values but hands back the key.',
            `def averages(gradebook):
    return {row["name"]: round(sum(row["scores"]) / len(row["scores"]), 1) for row in gradebook}


def best(gradebook):
    scored = averages(gradebook)
    return max(scored, key=scored.get)


print(best([
    {"name": "fox", "scores": [6, 7]},
    {"name": "owl", "scores": [8, 9]},
]))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def averages(gradebook):
    return {}


def best(gradebook):
    return gradebook[0]["name"]


print(best([
    {"name": "fox", "scores": [6, 7]},
    {"name": "owl", "scores": [8, 9]},
]))
`,
      'hidden_test.py': importAssert(`rows = [
    {"name": "fox", "zone": "north", "scores": [8, 9]},
    {"name": "owl", "zone": "south", "scores": [6, 7]},
    {"name": "badger", "zone": "north", "scores": [10]},
]
assert main.averages(rows) == {"fox": 8.5, "owl": 6.5, "badger": 10.0}
assert main.best(rows) == "badger"
assert main.averages([]) == {}
assert main.averages([{"name": "solo", "scores": [1, 2]}]) == {"solo": 1.5}`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-group-records',
      courseId: 'collections',
      moduleId: 'shape',
      title: 'Transfer: group the station records',
      skillIds: ['python.collections.dict', 'python.collections.comprehension'],
      estimatedMinutes: 20,
      mastery: { requiresTransfer: true },
      blocks: [
        teach({
          heading: 'Same move, unfamiliar records',
          idea:
            'Grouping is one move repeated: decide the bucket for an item, make sure that bucket exists, drop the item in. The bucket name can come from a letter, a date, a zone, or any field you name at call time — the loop never changes, only the expression that picks the key.',
          bites:
            'This bites when the field name is data rather than something you typed. `row.zone` is an attribute and will not work on a dictionary; `row[field]` is a lookup whose key arrives as an argument. Writing the field name into the function body is what makes a grouping helper usable exactly once.',
          code: `words = ["fox", "owl", "badger", "fern"]

by_letter = {}
for word in words:
    by_letter.setdefault(word[0], []).append(word)

print(by_letter)          # {'f': ['fox', 'fern'], 'o': ['owl'], 'b': ['badger']}
print(sorted(by_letter))  # ['b', 'f', 'o']`,
          mistake:
            'A common mistake is rebuilding the bucket every time, so each group ends up holding only the last item that landed in it. The exercise asks for a `group_by(records, field)` that works for any field, and a `names_by(records, field)` that reduces each group to just the names — the same station records grouped two different ways.'
        }),
        predict(
          'group-shape',
          'Grouping three records into two buckets gives you a dictionary with how many keys?',
          [
            { id: 'three', md: 'Three — one per record' },
            { id: 'two', md: 'Two — one per distinct bucket, each holding a list' }
          ],
          'two',
          {
            explainMd:
              'A grouping collapses many records into one key per distinct bucket value, and the value under each key is a list that can hold any number of records. The total number of records is preserved inside the lists, not in the number of keys.'
          }
        ),
        check(
          'field-by-name',
          'The bucket for a row should come from `row[field]` rather than `row["zone"]` because…',
          [
            { id: 'faster', md: 'Variable lookups are faster than string literals' },
            { id: 'reuse', md: 'The caller chooses which field to group on, so the same function works for zone, shift, or anything else' },
            { id: 'safe', md: 'It avoids a `KeyError`' }
          ],
          'reuse',
          {
            explainMd:
              'Passing the field in as an argument is what turns one grouping into a reusable tool: the same five lines group by zone today and by shift tomorrow. Hard-coding the key inside the body means writing the function again for every field you care about.'
          }
        ),
        pyCode({
          id: 'group-records',
          prompt:
            '> Write `group_by(records, field)` returning `{value: [row, ...]}`, and `names_by(records, field)` returning `{value: [name, ...]}`. Print `names_by(ROWS, "zone")`.',
          equals: "{'north': ['fox', 'stoat'], 'south': ['owl']}",
          hidden: true,
          hints: ladder(
            'Both starter functions return an empty dictionary, so nothing is being filed anywhere yet. Start with `group_by`; the second function is a small step on top of it.',
            'Loop the records. For each row, the bucket key is `row[field]`. `groups.setdefault(key, []).append(row)` files it whether or not the bucket already exists.',
            'Given rows with a `"colour"` field, `group_by(rows, "colour")["red"]` should be the list of whole rows whose colour was red — the rows themselves, not their names.',
            `def group_by(records, field):
    groups = {}
    for row in records:
        groups.setdefault(row[field], []).append(row)
    return groups


def names_by(records, field):
    return {key: [row["name"] for row in rows] for key, rows in group_by(records, field).items()}


ROWS = [
    {"name": "fox", "zone": "north", "shift": "am"},
    {"name": "owl", "zone": "south", "shift": "pm"},
    {"name": "stoat", "zone": "north", "shift": "pm"},
]
print(names_by(ROWS, "zone"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def group_by(records, field):
    return {}


def names_by(records, field):
    return {}


ROWS = [
    {"name": "fox", "zone": "north", "shift": "am"},
    {"name": "owl", "zone": "south", "shift": "pm"},
    {"name": "stoat", "zone": "north", "shift": "pm"},
]
print(names_by(ROWS, "zone"))
`,
      'hidden_test.py': importAssert(`rows = main.ROWS
assert main.names_by(rows, "zone") == {"north": ["fox", "stoat"], "south": ["owl"]}
assert main.names_by(rows, "shift") == {"am": ["fox"], "pm": ["owl", "stoat"]}
assert main.group_by(rows, "zone")["south"] == [rows[1]]
assert len(main.group_by(rows, "zone")["north"]) == 2
assert main.names_by([], "zone") == {}
assert main.group_by([], "zone") == {}`)
    }
  })

  // ----------------------------------------------------------- errors: read

  out.push({
    doc: lesson({
      id: 'read-the-traceback',
      courseId: 'errors',
      moduleId: 'read',
      title: 'Read the last line first',
      skillIds: ['python.errors', 'python.craft.debug'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'A traceback is printed backwards from what you need',
          idea:
            'When Python gives up it prints a traceback: a header, then one frame per call that was still in progress, then the error itself. The frames are listed oldest first, so the line that actually failed is at the **bottom**, immediately above the last line. That last line is the exception type and its message.',
          bites:
            'This bites because the eye starts at the top, reads `Traceback (most recent call last):` and the first `File` line, and concludes the bug is wherever the program began. That frame is only the entry point. Chasing it wastes the one piece of information the traceback was built to give you.',
          code: `def average(values):
    return sum(values) / len(values)


# average([]) stops the program and prints, in this order:
#   Traceback (most recent call last):
#     File "main.py", line 9, in <module>
#       average([])
#     File "main.py", line 2, in average
#       return sum(values) / len(values)
#   ZeroDivisionError: division by zero
print("start at the bottom: the type, then the message, then the frame above it")`,
          mistake:
            'A common mistake is reading only the type and skipping the message after the colon. `ZeroDivisionError` tells you what rule broke; `division by zero` tells you which value was wrong. The exercise asks you to pull both out of a traceback given as text, which forces you to look at the end of it rather than the beginning.'
        }),
        predict(
          'where-to-look',
          'Which line of a traceback names the error that actually stopped the program?',
          [
            { id: 'first', md: 'The first line, `Traceback (most recent call last):`', misconceptionId: 'traceback-reads-top-down' },
            { id: 'last', md: 'The last line, such as `ZeroDivisionError: division by zero`' }
          ],
          'last',
          {
            explainMd:
              'The first line is a fixed header that appears on every traceback and says nothing about your bug. The exception type and message are on the final line, and the frame just above it is the code that raised. Reading bottom-up turns a wall of text into two useful facts.'
          }
        ),
        check(
          'frame-order',
          'The `File ...` frames in a traceback are listed…',
          [
            { id: 'oldest', md: 'Oldest call first, so the line that failed is last' },
            { id: 'newest', md: 'Newest call first, so the line that failed is at the top' },
            { id: 'random', md: 'In no particular order' }
          ],
          'oldest',
          {
            explainMd:
              'That is exactly what the header promises: "most recent call last". The chain reads like a story — this called that, which called this — and the final frame is where it broke. Following the chain upwards is how you find which caller passed the bad value in.'
          }
        ),
        pyCode({
          id: 'parse-a-traceback',
          prompt:
            '> A traceback is sitting in `TRACE` as text. Write `last_line(text)` returning its final non-blank line, and `error_type(text)` returning just the exception type from that line. Print `error_type(TRACE)`.',
          equals: 'ZeroDivisionError',
          hidden: true,
          hints: ladder(
            'The starter prints the header line, which means it is reading the traceback from the top. Everything else about it is already right.',
            'Split the text into lines, drop the blank ones, and take the **last** one with `lines[-1]`. The exception type is everything before the first colon on that line, which `split(":")[0]` gives you.',
            'For the text `"a\\nb\\n"`, keeping the non-blank lines gives `["a", "b"]`, so `lines[-1]` is `"b"` and `lines[0]` is `"a"`.',
            `TRACE = """Traceback (most recent call last):
  File "main.py", line 9, in <module>
    print(average(readings))
  File "main.py", line 5, in average
    return total / len(values)
ZeroDivisionError: division by zero
"""


def last_line(text):
    lines = [line for line in text.splitlines() if line.strip()]
    return lines[-1]


def error_type(text):
    return last_line(text).split(":")[0]


print(error_type(TRACE))`
          )
        })
      ]
    }),
    files: {
      'main.py': `TRACE = """Traceback (most recent call last):
  File "main.py", line 9, in <module>
    print(average(readings))
  File "main.py", line 5, in average
    return total / len(values)
ZeroDivisionError: division by zero
"""


def last_line(text):
    lines = [line for line in text.splitlines() if line.strip()]
    return lines[0]


def error_type(text):
    return last_line(text).split(":")[0]


print(error_type(TRACE))
`,
      'hidden_test.py': `import main

assert main.last_line(main.TRACE) == "ZeroDivisionError: division by zero"
assert main.error_type(main.TRACE) == "ZeroDivisionError"

OTHER = """Traceback (most recent call last):
  File "main.py", line 3, in <module>
    open("missing.txt")
FileNotFoundError: no such file or directory
"""

assert main.last_line(OTHER) == "FileNotFoundError: no such file or directory"
assert main.error_type(OTHER) == "FileNotFoundError"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'try-except-specific',
      courseId: 'errors',
      moduleId: 'read',
      title: 'Catch the one you expected',
      skillIds: ['python.errors'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Naming the failure is the handling',
          idea:
            '`try` marks code that might fail and `except SomeError` says what to do about one specific way it can fail. Naming the error is not paperwork: it is the line that separates "this input was messy, carry on" from "something is broken, stop".',
          bites:
            'This bites when you write a bare `except:`. It catches absolutely everything — your typo, a wrong key, a name you never defined, even the interrupt that should stop the program. The code appears robust and is in fact silent, and the bug you did not plan for is now invisible.',
          code: `readings = {"north": "12", "east": "warm"}

for zone, raw in readings.items():
    try:
        print(zone, int(raw))
    except ValueError:
        print(zone, "not a number")

# north 12
# east not a number`,
          mistake:
            'A common mistake is catching too wide because you are not sure which error to name: run the code once, read the last line of the traceback, and catch that. You can name more than one with a tuple, as in `except (TypeError, ValueError):`. The exercise asks for a `to_int` that survives messy input and still lets a genuine bug through.'
        }),
        predict(
          'bare-except',
          'A colleague suggests using a bare `except:` everywhere "so nothing can ever crash". What is wrong with that?',
          [
            { id: 'bare', md: 'Nothing — catching everything is the safe default', misconceptionId: 'bare-except-is-handling' },
            { id: 'hides', md: 'It also swallows typos and bugs you never planned for, so real failures become silent' }
          ],
          'hides',
          {
            explainMd:
              'A bare `except:` catches every exception, including `NameError` from a misspelled variable and `KeyboardInterrupt` from you trying to stop the program. The code stops crashing but it also stops telling the truth. Catching the one error you expected leaves everything else free to be reported.'
          }
        ),
        check(
          'which-exception',
          '`int("warm")` raises which exception?',
          [
            { id: 'value', md: '`ValueError`' },
            { id: 'type', md: '`TypeError`' },
            { id: 'key', md: '`KeyError`' }
          ],
          'value',
          {
            explainMd:
              'The argument is the right **type** — a string is something `int` accepts — but the wrong **value**, because those characters are not a number, so Python raises `ValueError`. `int(None)` is the `TypeError` case: that type is not convertible at all.'
          }
        ),
        pyCode({
          id: 'to-int-safely',
          prompt:
            '> Write `to_int(raw, fallback=0)` so it returns the number when `raw` converts and `fallback` when it does not. Catch only the errors `int()` actually raises — no bare `except:`. Print `to_int("12", -1)`.',
          equals: '12',
          hidden: true,
          hints: ladder(
            'The starter ignores `raw` completely and always answers the fallback, so even a perfectly good `"12"` comes back as `-1`.',
            'Put `return int(raw)` inside a `try:` and return the fallback from the `except`. Two things can go wrong: characters that are not a number raise `ValueError`, and a value like `None` raises `TypeError`.',
            'For `def half(x):` you might write `try: return x / 2` and `except TypeError: return None`, so `half("a")` answers `None` instead of stopping the program.',
            `def to_int(raw, fallback=0):
    try:
        return int(raw)
    except (TypeError, ValueError):
        return fallback


print(to_int("12", -1))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def to_int(raw, fallback=0):
    return fallback


print(to_int("12", -1))
`,
      'hidden_test.py': `import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "except:" not in src, "catch the error you expect, not a bare except"

assert main.to_int("12") == 12
assert main.to_int("  7  ") == 7
assert main.to_int("warm", -1) == -1
assert main.to_int(None, 0) == 0
assert main.to_int("", 5) == 5
assert main.to_int("12", -1) == 12
`
    }
  })

  out.push({
    doc: lesson({
      id: 'else-and-finally',
      courseId: 'errors',
      moduleId: 'read',
      title: 'Else for success, finally for always',
      skillIds: ['python.errors'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Four blocks, four different moments',
          idea:
            'A `try` statement has room for four blocks and each one answers a different question. `try` is the risky part. `except` runs only when the named error happened. `else` runs only when the `try` body finished with no exception at all. `finally` runs either way, on the way out, no matter what.',
          bites:
            'This bites when success-only work is left sitting at the end of the `try` body. Anything you put there is also protected by the `except`, so an error thrown by the follow-up work gets reported as if the risky line had failed. Moving it to `else` keeps the `try` body down to the one line that can actually break.',
          code: `def open_log(raw):
    try:
        value = int(raw)
    except ValueError:
        print("could not read", raw)
        value = 0
    else:
        print("read", value)
    finally:
        print("done with", raw)
    return value


open_log("12")     # read 12 / done with 12
open_log("warm")   # could not read warm / done with warm`,
          mistake:
            'A common mistake is expecting `finally` to be skipped when the function returns early — it is not, it runs on the way out of every path, which is exactly why cleanup belongs there. The exercise asks you to record the story of a parse in a list, so the order of the three notes proves which block ran when.'
        }),
        check(
          'else-when',
          'The `else` block of a `try` statement runs when…',
          [
            { id: 'clean', md: 'The `try` body finished with no exception' },
            { id: 'caught', md: 'An exception was raised and caught' },
            { id: 'always', md: 'Always, like `finally`' }
          ],
          'clean',
          {
            explainMd:
              '`else` is the success path: it runs only if nothing in the `try` body raised. That makes it the right home for work that depends on the risky line having worked, without putting that work inside the protected block where its own failures would be misattributed.'
          }
        ),
        tf(
          'finally-always',
          '`finally` runs whether or not an exception was raised — including when the function returns from inside the `try`.',
          true,
          {
            explainMd:
              '`finally` is the on-the-way-out block. Success, handled error, unhandled error, or an early `return` all pass through it, which is why closing a file or releasing a lock belongs there and nowhere else. The only thing it cannot survive is the process being killed outright.'
          }
        ),
        pyCode({
          id: 'trail-of-blocks',
          prompt:
            '> Write `parse_with_report(raw, log)` so it appends `"ok"` on success, `"failed"` on a `ValueError`, and `"closed"` every time. Return the number, or `0` when it failed. Print the trail for `"warm"`.',
          equals: "['failed', 'closed']",
          hidden: true,
          hints: ladder(
            'The starter appends `"ok"` even when the parse failed, because that line sits outside the `try` statement altogether and runs on every path.',
            'Put the success note in an `else:` block so it only runs when `int(raw)` worked, and put the `"closed"` note in a `finally:` block so it runs on both paths. The `except ValueError:` block keeps the failure note.',
            'With `try: int("x")` / `except ValueError: log.append("bad")` / `else: log.append("good")` / `finally: log.append("out")`, the log ends up `["bad", "out"]` — `"good"` never runs.',
            `def parse_with_report(raw, log):
    try:
        value = int(raw)
    except ValueError:
        log.append("failed")
        value = 0
    else:
        log.append("ok")
    finally:
        log.append("closed")
    return value


trail = []
parse_with_report("warm", trail)
print(trail)`
          )
        })
      ]
    }),
    files: {
      'main.py': `def parse_with_report(raw, log):
    try:
        value = int(raw)
    except ValueError:
        log.append("failed")
        value = 0
    log.append("ok")
    return value


trail = []
parse_with_report("warm", trail)
print(trail)
`,
      'hidden_test.py': `import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "else:" in src, "use the else block for the success-only note"
assert "finally:" in src, "use the finally block for the note that always runs"

good = []
assert main.parse_with_report("12", good) == 12
assert good == ["ok", "closed"]

bad = []
assert main.parse_with_report("warm", bad) == 0
assert bad == ["failed", "closed"]
`
    }
  })

  // ---------------------------------------------------------- errors: raise

  out.push({
    doc: lesson({
      id: 'raise-and-custom-error',
      courseId: 'errors',
      moduleId: 'raise',
      title: 'Raise it, and name it yourself',
      skillIds: ['python.errors'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Refusing is a feature',
          idea:
            '`raise` is how a function says "I will not do that". `raise ValueError("zone name must not be empty")` stops the caller in its tracks with a reason attached, which is far kinder than returning `None` and letting a wrong value travel three functions before it breaks something unrelated.',
          bites:
            'This bites when a function returns a sentinel instead of raising. The caller forgets to check, `None` flows onward, and the traceback eventually points at innocent code far from the bad input. Raising puts the failure at the exact line where the rule was broken, with a message you wrote.',
          code: `class StationError(Exception):
    """Something the field station itself refuses to do."""


def set_zone(name):
    if not name:
        raise ValueError("zone name must not be empty")
    if name not in ("north", "east", "south", "west"):
        raise StationError("unknown zone: " + str(name))
    return name


print(set_zone("north"))    # north`,
          mistake:
            'A common mistake is inventing a custom error for a failure the language already names. Bad argument values are what `ValueError` is for. Keep a custom class for rules that only your station has, and have it inherit from `Exception` so callers can catch it by name. The exercise asks you to raise and then catch your own error.'
        }),
        check(
          'why-raise',
          'Raising on bad input, rather than returning `None`, mainly buys you…',
          [
            { id: 'here', md: 'The failure is reported at the line that broke the rule, with a message, instead of surfacing later somewhere else' },
            { id: 'fast', md: 'Faster code' },
            { id: 'short', md: 'Fewer lines in the caller, because exceptions are shorter than checks' }
          ],
          'here',
          {
            explainMd:
              'A sentinel like `None` only fails when somebody finally uses it, which can be far from the cause. An exception fails immediately, at the line that knew what was wrong, and carries a message explaining it. That distance between cause and symptom is most of the cost of debugging.'
          }
        ),
        tf(
          'custom-inherits',
          'A custom error class must inherit from `Exception`, directly or through another exception class, before you can raise it.',
          true,
          {
            explainMd:
              '`raise` only accepts exception classes and instances, so `class StationError(Exception): pass` is the smallest useful custom error. Inheriting from `Exception` is also what lets a caller write `except StationError:` for your rules and `except Exception:` for everything.'
          }
        ),
        pyCode({
          id: 'raise-station-error',
          prompt:
            '> Make `set_zone(name)` return the name for a known zone and `raise StationError` with the offending name in the message otherwise. The starter already catches it and prints the message; make that message appear.',
          equals: 'unknown zone: attic',
          hidden: true,
          hints: ladder(
            'The starter prints nothing at all. The `except` block never runs, which means `set_zone` accepted `"attic"` without complaint.',
            'Check the name against the four known zones and `raise StationError(...)` when it is not one of them. Put the rejected name inside the message so the person reading the output knows what was refused.',
            'For `def pick(n):` you might write `if n < 0: raise ValueError("negative: " + str(n))`, and `pick(-2)` then stops with the message `negative: -2`.',
            `class StationError(Exception):
    """Something the field station refuses to do."""


def set_zone(name):
    if name not in ("north", "east", "south", "west"):
        raise StationError("unknown zone: " + str(name))
    return name


try:
    set_zone("attic")
except StationError as err:
    print(err)`
          )
        })
      ]
    }),
    files: {
      'main.py': `class StationError(Exception):
    """Something the field station refuses to do."""


def set_zone(name):
    return name


try:
    set_zone("attic")
except StationError as err:
    print(err)
`,
      'hidden_test.py': importAssert(`assert issubclass(main.StationError, Exception)
assert main.set_zone("north") == "north"
assert main.set_zone("west") == "west"

try:
    main.set_zone("attic")
except main.StationError as err:
    assert "attic" in str(err), "put the rejected name in the message"
else:
    raise AssertionError("set_zone should raise StationError for an unknown zone")`)
    }
  })

  out.push({
    doc: lesson({
      id: 'eafp-vs-lbyl',
      courseId: 'errors',
      moduleId: 'raise',
      title: 'Ask first, or try and recover',
      skillIds: ['python.errors'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Two styles with two different blind spots',
          idea:
            'Look Before You Leap checks that an operation will work, then does it. Easier to Ask Forgiveness than Permission just does it and handles the failure. Python leans on the second, because a `try` block states the operation once, while a guard has to predict every way it could go wrong.',
          bites:
            'This bites when the guard is incomplete. `if zone in rows:` proves the key exists and says nothing about whether the list behind it has anything in it, so `rows[zone][0]` still raises. Each extra condition is another chance to forget one, and the code drifts away from the operation it is guarding.',
          code: `counts = {"fox": 3}

# Look before you leap: ask, then act.
if "owl" in counts:
    print(counts["owl"])
else:
    print(0)

# Easier to ask forgiveness: act, then handle.
try:
    print(counts["owl"])
except KeyError:
    print(0)`,
          mistake:
            'A common mistake is treating one style as always correct. A cheap check that is expected to fail most of the time reads better as a guard; anything with several failure modes, or where the state could change between the check and the act, reads better inside a `try`. The exercise gives you two lookups whose guards are awkward and whose `try` blocks are not.'
        }),
        predict(
          'eafp-shape',
          'Which shape is the idiom Python calls EAFP?',
          [
            { id: 'guard', md: 'Test every precondition with `if`, then perform the operation' },
            { id: 'try', md: 'Perform the operation inside `try`, and handle the failure in `except`' }
          ],
          'try',
          {
            explainMd:
              'EAFP stands for "easier to ask forgiveness than permission": do the thing, catch the specific failure. The operation appears once, in its normal form, and the recovery sits next to it. LBYL is the other shape — useful, but it makes you enumerate the failures in advance.'
          }
        ),
        check(
          'lbyl-gap',
          'The guard `if zone in rows:` can still be followed by a crash because…',
          [
            { id: 'partial', md: 'It only proves the key exists — the value behind it can still be empty or the wrong shape' },
            { id: 'slow', md: '`in` is too slow on large dictionaries' },
            { id: 'nolists', md: 'Dictionaries cannot hold lists' }
          ],
          'partial',
          {
            explainMd:
              'A guard only covers the condition it names. `rows[zone][0]` needs the key **and** a non-empty list, so a single `in` check leaves an `IndexError` waiting. A `try` around the whole expression covers both failures with one `except (KeyError, IndexError):`.'
          }
        ),
        pyCode({
          id: 'try-then-recover',
          prompt:
            '> Rewrite both functions in the EAFP style. `as_number(value)` returns a float or `None`; `first_reading(rows, zone)` returns the first reading or `None`. Print both for the starter values.',
          equals: '12.5 None',
          hidden: true,
          hints: ladder(
            'The starter guards instead of trying, and its guard for `as_number` is wrong: `"12.5".isdigit()` is `False` because of the dot, so a perfectly good number comes back as `None`.',
            'Put `return float(value)` inside a `try:` and catch `(TypeError, ValueError)`. Put `return rows[zone][0]` inside a `try:` and catch `(KeyError, IndexError)`. Each function then states its operation once.',
            'For `def head(xs):` writing `try: return xs[0]` with `except IndexError: return None` handles the empty list without ever measuring its length.',
            `def as_number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def first_reading(rows, zone):
    try:
        return rows[zone][0]
    except (KeyError, IndexError):
        return None


print(as_number("12.5"), first_reading({"north": []}, "north"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def as_number(value):
    if isinstance(value, str) and value.isdigit():
        return float(value)
    return None


def first_reading(rows, zone):
    if zone in rows and len(rows[zone]) > 0:
        return rows[zone][0]
    return None


print(as_number("12.5"), first_reading({"north": []}, "north"))
`,
      'hidden_test.py': `import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "try:" in src, "this lesson wants the try/except shape"
assert "except:" not in src, "name the errors you expect"

assert main.as_number("12.5") == 12.5
assert main.as_number(7) == 7.0
assert main.as_number("warm") is None
assert main.as_number(None) is None
assert main.as_number("") is None

assert main.first_reading({"north": [4, 5]}, "north") == 4
assert main.first_reading({"north": []}, "north") is None
assert main.first_reading({}, "south") is None
`
    }
  })

  out.push({
    doc: lesson({
      id: 'debug-swallowed-error',
      courseId: 'errors',
      moduleId: 'raise',
      title: 'Debug: the error nobody heard',
      skillIds: ['python.errors', 'python.craft.debug'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'Silence is not success',
          idea:
            '`except: pass` is the quietest bug in Python. It catches every exception and then does nothing about it, so a program with a real fault in it runs to completion, exits zero, and prints a plausible-looking answer. There is no traceback, because the traceback was caught and dropped.',
          bites:
            'This bites hardest when the swallowed error is not the one you were guarding against. A loop meant to skip the odd unreadable value also silently skips a misspelled key — every single row — and the total comes out as zero. The output is wrong and the program looks healthy.',
          code: `rows = [{"reading": "12"}, {"reading": "warm"}]

total = 0
for row in rows:
    try:
        total += int(row["reading"])
    except ValueError:      # only the failure you actually expected
        continue
print(total)                # 12, and a typo in "reading" would still raise`,
          mistake:
            'A common mistake is narrowing the `except` and leaving `pass` behind, which still hides how many rows were skipped. The starter below totals the station readings and reports `0`. One bad row is expected; all of them are not. Widen nothing — narrow the `except` until the real failure can be heard, then fix it.'
        }),
        predict(
          'what-hides',
          'A loop with `except: pass` around a dictionary lookup totals `0` instead of `19`. What is the most likely cause?',
          [
            { id: 'empty', md: 'The list of rows is empty' },
            { id: 'key', md: 'Every row raises — most likely the key name is wrong — and the bare `except` hides it' }
          ],
          'key',
          {
            explainMd:
              'A total of zero from a non-empty list means the accumulating line never succeeded once. A bare `except` cannot tell you that, because it treats a misspelled key exactly like the messy value you were prepared for. Narrowing it to the expected error makes the real one show itself.'
          }
        ),
        check(
          'narrow-it',
          'To make the hidden failure visible, the first thing to change is…',
          [
            { id: 'narrow', md: 'Replace `except:` with the specific error you expect, so anything else is reported' },
            { id: 'print', md: 'Add more `print` calls inside the `try` block' },
            { id: 'remove', md: 'Delete the loop and total the values by hand' }
          ],
          'narrow',
          {
            explainMd:
              'Narrowing the `except` costs one line and immediately promotes every unexpected failure back into a traceback, which then names the real problem for you. Printing from inside a block whose exception is swallowed often shows nothing, because the failing line never reaches the print.'
          }
        ),
        pyCode({
          id: 'surface-the-bug',
          debug: true,
          prompt:
            '> `total_readings(ROWS)` prints `0` when it should print `19`. Narrow the `except` so the hidden failure is reported, fix what it tells you, and also finish `skipped(rows)` so it counts the rows that genuinely are not numbers.',
          equals: '19',
          hidden: true,
          hints: ladder(
            'Two of the three readings are numbers, so a total of `0` means every row failed, not one. The bare `except` is why you cannot see which error it was.',
            'Change `except:` to `except ValueError:` and run it again. Python will now report the failure it was hiding, and the traceback names the key that does not exist in these rows.',
            'If a row is `{"zone": "north", "reading": "12"}`, then `row["value"]` raises `KeyError` while `row["reading"]` is the string you wanted.',
            `ROWS = [
    {"zone": "north", "reading": "12"},
    {"zone": "east", "reading": "7"},
    {"zone": "south", "reading": "warm"},
]


def total_readings(rows):
    total = 0
    for row in rows:
        try:
            total += int(row["reading"])
        except ValueError:
            continue
    return total


def skipped(rows):
    count = 0
    for row in rows:
        try:
            int(row["reading"])
        except ValueError:
            count += 1
    return count


print(total_readings(ROWS))`
          )
        })
      ]
    }),
    files: {
      'main.py': `ROWS = [
    {"zone": "north", "reading": "12"},
    {"zone": "east", "reading": "7"},
    {"zone": "south", "reading": "warm"},
]


def total_readings(rows):
    total = 0
    for row in rows:
        try:
            total += int(row["value"])
        except:
            pass
    return total


def skipped(rows):
    return 0


print(total_readings(ROWS))
`,
      'hidden_test.py': `import main
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "except:" not in src, "narrow the bare except to the error you expect"

assert main.total_readings(main.ROWS) == 19
assert main.skipped(main.ROWS) == 1
assert main.total_readings([{"zone": "west", "reading": "5"}]) == 5
assert main.total_readings([]) == 0
assert main.skipped([]) == 0
assert main.skipped([{"zone": "west", "reading": "damp"}]) == 1
`
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-safe-parse',
      courseId: 'errors',
      moduleId: 'raise',
      title: 'Transfer: a parser that never raises',
      skillIds: ['python.errors'],
      estimatedMinutes: 20,
      mastery: { requiresTransfer: true },
      blocks: [
        teach({
          heading: 'Report the failure, do not become it',
          idea:
            'Some functions sit at the edge of a program, where messy input is normal rather than exceptional. Those are worth writing so they never raise: they return the value **and** an honest note about whether it worked. The caller then decides what to do, with the reason in hand.',
          bites:
            'This bites when the honest note gets dropped. A parser that answers `None` for both "the value was zero" and "that was not a number" has thrown away the distinction its caller needed. Returning a pair — the value, and the reason it failed — keeps success and failure telling different stories.',
          code: `def as_bool_safe(raw):
    text = str(raw).strip().lower()
    if text in ("yes", "true", "1"):
        return True, None
    if text in ("no", "false", "0"):
        return False, None
    return None, "not a yes or no: " + repr(raw)


print(as_bool_safe(" YES "))   # (True, None)
print(as_bool_safe("maybe"))   # (None, "not a yes or no: 'maybe'")`,
          mistake:
            'A common mistake is stripping and checking by hand until every shape of bad input has its own branch — you will always miss one. Wrap the conversion in `try` instead and let the conversion itself decide. The exercise asks for `parse_int_safe(raw)` and a `parse_all(raws)` that sorts a whole column into values and problems.'
        }),
        predict(
          'pair-shape',
          'A safe parser returns `(value, reason)`. For a successful parse of `" 12 "`, what comes back?',
          [
            { id: 'both', md: '`(12, "ok")`' },
            { id: 'clean', md: '`(12, None)` — a reason only appears when something failed' }
          ],
          'clean',
          {
            explainMd:
              'Keeping the reason empty on success means a caller can test one thing: `if reason is None`. Filling it with a cheerful `"ok"` forces every caller to compare against a magic string, and the first typo in that string is a bug nobody sees.'
          }
        ),
        check(
          'never-raises',
          'What makes a function "never raises" in practice?',
          [
            { id: 'try', md: 'Every operation that can fail is inside a `try`, and the `except` returns a failure report instead of propagating' },
            { id: 'checks', md: 'It checks the input type before doing anything' },
            { id: 'bare', md: 'It wraps the body in `except: pass`' }
          ],
          'try',
          {
            explainMd:
              'Type checks can only cover the shapes you thought of, and `except: pass` hides the reason rather than reporting it. The workable version is a `try` around the risky conversion whose `except` turns the exception into a returned value the caller can read and act on.'
          }
        ),
        pyCode({
          id: 'parse-int-safe',
          prompt:
            '> Write `parse_int_safe(raw)` returning `(value, None)` on success and `(None, reason)` on failure, for **any** input without raising. Then write `parse_all(raws)` returning `(values, problems)`. Print `parse_int_safe(" 12 ")`.',
          equals: '(12, None)',
          hidden: true,
          hints: ladder(
            'The starter returns a bare number rather than a pair, and it will stop the program the first time it meets something that is not a number.',
            'Convert inside a `try:` and return `int(str(raw).strip()), None`. In the `except (TypeError, ValueError):` return `None` together with a reason string that mentions the offending value. `parse_all` then loops and sorts each result into one of two lists.',
            'For a similar `parse_float_safe`, `parse_float_safe("x")` should give `(None, "not a number: x")` while `parse_float_safe("1.5")` gives `(1.5, None)`.',
            `def parse_int_safe(raw):
    try:
        return int(str(raw).strip()), None
    except (TypeError, ValueError):
        return None, "not a whole number: " + repr(raw)


def parse_all(raws):
    values = []
    problems = []
    for raw in raws:
        value, reason = parse_int_safe(raw)
        if reason is None:
            values.append(value)
        else:
            problems.append(reason)
    return values, problems


print(parse_int_safe(" 12 "))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def parse_int_safe(raw):
    return int(raw)


def parse_all(raws):
    return [], []


print(parse_int_safe(" 12 "))
`,
      'hidden_test.py': importAssert(`assert main.parse_int_safe(" 12 ") == (12, None)
assert main.parse_int_safe("0") == (0, None)

value, reason = main.parse_int_safe("warm")
assert value is None
assert isinstance(reason, str) and "warm" in reason

for weird in [None, "", "x", 3.7, [1], {}]:
    value, reason = main.parse_int_safe(weird)
    assert (value is None) != (reason is None), "exactly one of value and reason is set"

values, problems = main.parse_all([" 3 ", "warm", "4"])
assert values == [3, 4]
assert len(problems) == 1 and "warm" in problems[0]
assert main.parse_all([]) == ([], [])`)
    }
  })

  // ------------------------------------------------------------- shape text

  out.push({
    doc: lesson({
      id: 'string-methods-clean',
      courseId: 'text',
      moduleId: 'shape-text',
      title: 'Tidy a string without changing it',
      skillIds: ['python.values.strings'],
      estimatedMinutes: 15,
      blocks: [
        teach({
          heading: 'Every method hands back a new string',
          idea:
            'The string methods you reach for most — `strip`, `lower`, `upper`, `replace` — never edit the string you called them on. They build a second string and return it. The original is immutable, so the only way to keep the tidied version is to catch what comes back.',
          bites:
            'This bites in a loop over a log file. Writing `line.strip()` on its own line looks like cleaning; it computes a tidy string and throws it away, and the comparison two lines later still sees the trailing spaces. Nothing raises, the filter simply never matches.',
          code: `raw = "  North Ridge  "
print(raw.strip())                      # 'North Ridge'
print(raw.strip().lower())              # 'north ridge'
print("north ridge".replace(" ", "-"))  # 'north-ridge'
print("ERR: cold".startswith("ERR"))    # True
print(repr(raw))                        # '  North Ridge  ' - still untouched`,
          mistake:
            'A common mistake is calling a method and forgetting the assignment, as in `raw.strip()` where you meant `raw = raw.strip()`. Chaining helps, because each method takes the result of the last one and the whole chain becomes one expression. The exercise asks you to turn a scruffy zone name into a clean slug in a single chain.'
        }),
        predict(
          'strip-mutates',
          '`raw = "  north  "` then `raw.strip()` on a line by itself. What is `raw` afterwards?',
          [
            { id: 'trimmed', md: '`"north"` — the method trimmed it', misconceptionId: 'strings-mutate-in-place' },
            { id: 'same', md: '`"  north  "` — the trimmed copy was discarded' }
          ],
          'same',
          {
            explainMd:
              'Strings are immutable, so `strip()` cannot change `raw`; it returns a new string, and a statement that ignores the return value simply throws it away. `raw = raw.strip()` is the line that keeps it. Every other string method behaves the same way.'
          }
        ),
        check(
          'startswith-returns',
          '`"ERR: cold".startswith("ERR")` returns…',
          [
            { id: 'bool', md: '`True` — a boolean' },
            { id: 'text', md: 'The matched text, `"ERR"`' },
            { id: 'index', md: 'The position `0`' }
          ],
          'bool',
          {
            explainMd:
              '`startswith` answers a yes-or-no question and returns a `bool`, which is why it drops straight into an `if` with no comparison. The method that hands back a position is `find`, and it returns `-1` rather than raising when there is no match.'
          }
        ),
        pyCode({
          id: 'clean-a-zone',
          prompt:
            '> Write `clean_zone(raw)` returning the name trimmed, lowercased, with spaces turned into hyphens, and `is_error(line)` returning `True` when a line starts with `ERR` in any case. Print `clean_zone("  North Ridge  ")`.',
          equals: 'north-ridge',
          hidden: true,
          hints: ladder(
            'The starter calls `strip()` and then returns `raw` anyway, so the tidy version is computed and dropped. `is_error` never looks at its argument at all.',
            'Chain the three methods into one expression and return it: trim, lowercase, then replace spaces with hyphens. For `is_error`, normalise the case first so that `err:` and `ERR:` both match.',
            'For `" Big Tree ".strip().lower().replace(" ", "_")` the answer is `"big_tree"` — each method works on the result of the one before it.',
            `def clean_zone(raw):
    return raw.strip().lower().replace(" ", "-")


def is_error(line):
    return line.strip().upper().startswith("ERR")


print(clean_zone("  North Ridge  "))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def clean_zone(raw):
    raw.strip()
    return raw


def is_error(line):
    return False


print(clean_zone("  North Ridge  "))
`,
      'hidden_test.py': importAssert(`assert main.clean_zone("  North Ridge  ") == "north-ridge"
assert main.clean_zone("EAST") == "east"
assert main.clean_zone("south  bank") == "south--bank"
assert main.clean_zone("") == ""
assert main.is_error("  err: cold  ") is True
assert main.is_error("ERR: cold") is True
assert main.is_error("ok: warm") is False`)
    }
  })

  out.push({
    doc: lesson({
      id: 'split-and-join',
      courseId: 'text',
      moduleId: 'shape-text',
      title: 'From one string to many and back',
      skillIds: ['python.values.strings'],
      estimatedMinutes: 15,
      blocks: [
        teach({
          heading: 'Two halves of the same trip',
          idea:
            '`split` cuts a string into a list wherever it finds a separator, and `join` glues a list of strings back together with a separator between them. One line of a station log becomes fields you can work with, and the fields become a line again once you are done.',
          bites:
            'This bites because `join` reads backwards the first time. You write `", ".join(parts)`, not `parts.join(", ")`, because the separator is the string doing the joining and the list is what it is handed. It also bites when a part is not a string: `join` raises `TypeError` rather than converting numbers for you.',
          code: `line = "north,12,ok"
parts = line.split(",")
print(parts)                  # ['north', '12', 'ok']
print(", ".join(parts))       # 'north, 12, ok'
print("-".join(["x", "y"]))   # 'x-y'

print("a b   c".split())      # ['a', 'b', 'c'] - no argument collapses whitespace
print("a,b,,c".split(","))    # ['a', 'b', '', 'c'] - an argument keeps the gap`,
          mistake:
            'A common mistake is assuming `split(",")` trims for you. It does not: `"a , b".split(",")` gives `["a ", " b"]`, spaces and all. The exercise asks you to split a scruffy comma line into clean fields and then render them with a `" | "` separator, so both directions get exercised.'
        }),
        check(
          'join-receiver',
          'In `", ".join(parts)`, which one is the separator?',
          [
            { id: 'sep', md: 'The string you call `join` on — `", "`' },
            { id: 'list', md: 'The list `parts`' },
            { id: 'both', md: 'Neither — `join` always uses a space' }
          ],
          'sep',
          {
            explainMd:
              '`join` is a method on the separator, so the string before the dot is what ends up between the items. Reading it as "glue these parts with this string" makes the order feel right. `"".join(parts)` is the version with no separator at all.'
          }
        ),
        predict(
          'split-no-arg',
          'What is `"a b   c".split()` with no argument?',
          [
            { id: 'gaps', md: "`['a', 'b', '', '', 'c']`" },
            { id: 'clean', md: "`['a', 'b', 'c']`" }
          ],
          'clean',
          {
            explainMd:
              '`split()` with no argument treats any run of whitespace as one separator and ignores leading and trailing whitespace, so you never get empty strings. `split(" ")` with an explicit space is the strict version, and that one does produce the empty entries.'
          }
        ),
        pyCode({
          id: 'fields-and-render',
          prompt:
            '> Write `fields(line)` splitting on commas and trimming each part, and `render(parts)` joining them with `" | "`. Print `render(fields("north , 12 ,ok"))`.',
          equals: 'north | 12 | ok',
          hidden: true,
          hints: ladder(
            'Look closely at what the starter prints: the brackets and quotes are there because `render` is turning the list into text with `str`, not joining it. The fields still carry their stray spaces too.',
            'Split on the comma, then strip each part — a list comprehension does both in one line. For `render`, call `join` on the separator string and hand it the list.',
            'For `[p.strip() for p in "a , b".split(",")]` you get `["a", "b"]`, and `" / ".join(["a", "b"])` is `"a / b"`.',
            `def fields(line):
    return [part.strip() for part in line.split(",")]


def render(parts):
    return " | ".join(parts)


print(render(fields("north , 12 ,ok")))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def fields(line):
    return line.split(",")


def render(parts):
    return str(parts)


print(render(fields("north , 12 ,ok")))
`,
      'hidden_test.py': importAssert(`assert main.fields("north , 12 ,ok") == ["north", "12", "ok"]
assert main.fields("solo") == ["solo"]
assert main.fields(" a,b ") == ["a", "b"]
assert main.render(["a", "b"]) == "a | b"
assert main.render(["solo"]) == "solo"
assert main.render([]) == ""`)
    }
  })

  out.push({
    doc: lesson({
      id: 'slicing-text',
      courseId: 'text',
      moduleId: 'shape-text',
      title: 'Slices work on text too',
      skillIds: ['python.values.strings'],
      estimatedMinutes: 15,
      blocks: [
        teach({
          heading: 'A string is a sequence of characters',
          idea:
            'Everything you learned about slicing a list works on a string, because a string is a sequence too. `code[:2]` takes the first two characters, `code[-3:]` takes the last three, and the result is always a new string — the original is immutable and stays exactly as it was.',
          bites:
            'This bites when a slice reaches past the end. Indexing one character too far raises `IndexError`, but slicing silently clamps: `"fox"[0:99]` is just `"fox"`. That forgiveness is useful and it also means a slice with the wrong numbers can quietly return less than you expected instead of complaining.',
          code: `code = "NR-2041-fox"
print(code[:2])      # 'NR'
print(code[3:7])     # '2041'
print(code[-3:])     # 'fox'
print(code[::2])     # 'N-01fx' - every second character
print(code[::-1])    # 'xof-1402-RN' - a step of -1 reverses
print(code[0:99])    # 'NR-2041-fox' - clamped, not an error`,
          mistake:
            'A common mistake is reaching for a loop to reverse a string when `text[::-1]` already does it. The third number in a slice is the step, and a negative step walks backwards. The exercise asks for three small readers over a station code, one of which is that reversal.'
        }),
        check(
          'reverse-slice',
          'What is `"fox"[::-1]`?',
          [
            { id: 'rev', md: "`'xof'`" },
            { id: 'same', md: "`'fox'`" },
            { id: 'last', md: "`'x'`" }
          ],
          'rev',
          {
            explainMd:
              'The third slot in a slice is the step. Leaving the start and end empty means "the whole thing", and a step of `-1` walks it backwards, so the characters come out in reverse order as a brand new string.'
          }
        ),
        tf(
          'slice-out-of-range',
          "`'fox'[0:99]` raises `IndexError`.",
          false,
          {
            explainMd:
              'Slicing clamps to the ends of the sequence, so an over-long slice just returns what is there — `"fox"`. Plain indexing is the strict one: `"fox"[99]` really does raise `IndexError`. It is worth knowing which of the two will warn you.'
          }
        ),
        pyCode({
          id: 'read-a-code',
          prompt:
            '> A station code looks like `"NR-2041-fox"`. Write `station_code(code)` for the first two characters, `year(code)` for the four digits, and `reversed_tag(code)` for the whole thing backwards. Print `year("NR-2041-fox")`.',
          equals: '2041',
          hidden: true,
          hints: ladder(
            'The starter prints `204`, which is three digits, not four. Count the positions in `"NR-2041-fox"` before you adjust the slice.',
            'The year starts at index 3, and a slice stops **before** its end index, so four digits means an end of 7. For the reversal, remember the third slice slot is the step.',
            'In `"AB-1999-owl"`, `code[:2]` is `"AB"` and `code[3:7]` is `"1999"`.',
            `def station_code(code):
    return code[:2]


def year(code):
    return code[3:7]


def reversed_tag(code):
    return code[::-1]


print(year("NR-2041-fox"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def station_code(code):
    return code


def year(code):
    return code[3:6]


def reversed_tag(code):
    return code


print(year("NR-2041-fox"))
`,
      'hidden_test.py': importAssert(`assert main.station_code("NR-2041-fox") == "NR"
assert main.station_code("SW-1999-owl") == "SW"
assert main.year("NR-2041-fox") == "2041"
assert main.year("SW-1999-owl") == "1999"
assert main.reversed_tag("fox") == "xof"
assert main.reversed_tag("") == ""
assert main.reversed_tag("ab") == "ba"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'fstring-formatting',
      courseId: 'text',
      moduleId: 'shape-text',
      title: 'Format specs inside an f-string',
      skillIds: ['python.values.strings'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Everything after the colon is instructions',
          idea:
            'Inside an f-string placeholder, a colon starts a format spec: how to render this value, not which value to render. `{reading:.2f}` means "as a fixed-point number with two decimals". `{zone:>8}` means "right-aligned in eight columns". The value itself is untouched; only its text form changes.',
          bites:
            'This bites when you round with `round()` and then wonder why a column will not line up. `round(1.5, 2)` is the number `1.5` and prints as `1.5`; `f"{1.5:.2f}"` is the text `1.50`. One is arithmetic, the other is presentation, and a report needs the second.',
          code: `zone = "north"
reading = 12.3456

print(f"{reading:.2f}")     # 12.35
print(f"{zone:>8}|")        # '   north|' - right aligned in 8 columns
print(f"{zone:<8}|")        # 'north   |' - left aligned
print(f"{zone!r}")          # 'north' - repr, quotes included
print(f"{reading:8.1f}|")   # '    12.3|' - width and precision together`,
          mistake:
            'A common mistake is confusing `!r` with a format spec — it is a conversion, it comes before the colon, and it asks for `repr(value)` rather than `str(value)`. That is how you get the quotes that show whether a value was text or a number. The exercise asks for one aligned report row and one quoted tag.'
        }),
        check(
          'spec-f',
          'What does `f"{3.14159:.2f}"` produce?',
          [
            { id: 'two', md: "`'3.14'`" },
            { id: 'full', md: "`'3.14159'`" },
            { id: 'int', md: "`'3'`" }
          ],
          'two',
          {
            explainMd:
              '`.2f` means fixed-point with exactly two digits after the decimal, rounded for display. It also pads: `f"{3.1:.2f}"` is `"3.10"`, which is what makes a column of numbers line up even when the values have different precision.'
          }
        ),
        check(
          'bang-r',
          'What does `!r` ask for in `f"{name!r}"`?',
          [
            { id: 'repr', md: 'The `repr()` of the value — quotes and all, for a string' },
            { id: 'reverse', md: 'The value reversed' },
            { id: 'round', md: 'The value rounded' }
          ],
          'repr',
          {
            explainMd:
              '`!r` switches from `str(value)` to `repr(value)`, the developer-facing form. For text that means the quotes appear, so a log line can show the difference between the number `12` and the string `"12"` — exactly the distinction you need when a parse went wrong.'
          }
        ),
        pyCode({
          id: 'aligned-row',
          prompt:
            '> Write `row(zone, reading)` returning the zone left-aligned in 8 columns followed by the reading right-aligned in 7 with 2 decimals, and `tag(value)` returning the value as `repr`. Print the row in square brackets.',
          equals: '[north     12.35]',
          hidden: true,
          hints: ladder(
            'The starter glues the zone and the number together with a space, so nothing lines up and the reading keeps all four of its decimal digits.',
            'Use one f-string with two placeholders. The zone spec is `<8` for left alignment in eight columns; the reading spec is `>7.2f` for right alignment in seven columns with two decimals. For `tag`, the conversion is `!r`.',
            '`f"{\'ab\':<4}|"` is `"ab  |"` and `f"{1.5:>6.2f}"` is `"  1.50"`.',
            `def row(zone, reading):
    return f"{zone:<8}{reading:>7.2f}"


def tag(value):
    return f"{value!r}"


print(f"[{row('north', 12.3456)}]")`
          )
        })
      ]
    }),
    files: {
      'main.py': `def row(zone, reading):
    return zone + " " + str(reading)


def tag(value):
    return str(value)


print(f"[{row('north', 12.3456)}]")
`,
      'hidden_test.py': importAssert(`assert main.row("north", 12.3456) == "north     12.35"
assert main.row("e", 1.0) == "e          1.00"
assert len(main.row("north", 12.3456)) == 15
assert main.tag("north") == "'north'"
assert main.tag(12) == "12"`)
    }
  })

  // ---------------------------------------------------------------- patterns

  out.push({
    doc: lesson({
      id: 'regex-search',
      courseId: 'text',
      moduleId: 'patterns',
      title: 'Find a shape, not a word',
      skillIds: ['python.text.regex'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'A pattern describes what the text looks like',
          idea:
            'A regular expression describes a **shape** of text rather than a literal one. `\\d{4}` means four digits in a row, wherever they are. `re.search(pattern, text)` scans the whole string for the first place that shape occurs and returns a match object, or `None` if the shape never appears.',
          bites:
            'This bites when you reach for `re.match` by name. `match` only tries the pattern at position zero, so a level word sitting in the middle of a log line is never found and you conclude the pattern is broken. `search` is the one that looks everywhere; `match` is the one that anchors to the start.',
          code: String.raw`import re

line = "2041-03-02 ERR north sensor cold"

print(re.search(r"ERR", line))            # a match object, not a bool
print(re.match(r"ERR", line))             # None - match only tries the start
print(re.search(r"\d{4}", line).group())  # '2041'
print(re.search(r"[A-Z]{3}", line).group())   # 'ERR'
print(re.search(r"fox", line))            # None - no match at all`,
          mistake:
            'A common mistake is calling `.group()` on the result without checking it. When nothing matched the result is `None`, and `None.group()` raises `AttributeError` rather than telling you the pattern missed. The exercise asks for two readers over a log line, both of which have to survive a line that does not match.'
        }),
        check(
          'match-vs-search',
          '`re.match(r"ERR", line)` on a line where `ERR` sits in the middle returns…',
          [
            { id: 'none', md: '`None`' },
            { id: 'match', md: 'A match object for the `ERR` in the middle' },
            { id: 'bool', md: '`False`' }
          ],
          'none',
          {
            explainMd:
              '`re.match` anchors at position zero and gives up if the pattern does not fit there, so it returns `None` rather than scanning onward. `re.search` is the scanning version. Neither returns a boolean — they return a match object or `None`, which is why `if found:` works but `== True` does not.'
          }
        ),
        tf(
          'raw-string',
          'The `r` prefix on `r"\\d{4}"` stops Python from treating the backslash as an escape, which is why patterns are written as raw strings.',
          true,
          {
            explainMd:
              'Without the `r`, Python would try to interpret the backslash sequence itself before the regex engine ever saw it, and some of those sequences mean something different or nothing at all. Writing every pattern as a raw string means what you type is exactly what the engine receives.'
          }
        ),
        pyCode({
          id: 'find-level-and-stamp',
          prompt:
            '> Write `level(line)` returning `ERR`, `WARN` or `INFO` when the line contains one and `"UNKNOWN"` otherwise, and `stamp(line)` returning the `YYYY-MM-DD` date or `None`. Print `level(...)` for the sample line.',
          equals: 'ERR',
          hidden: true,
          hints: ladder(
            'Both starter functions ignore the line entirely and answer the not-found case every time. The sample line does contain a level word.',
            'Use `re.search` so the pattern can be found anywhere in the line, and check the result against `None` before calling `.group()`. Alternatives go in a group separated by `|`, as in `(ERR|WARN|INFO)`.',
            'For a date, the pattern `r"\\d{4}-\\d{2}-\\d{2}"` matches four digits, a hyphen, two digits, a hyphen, and two more.',
            String.raw`import re


def level(line):
    found = re.search(r"ERR|WARN|INFO", line)
    if found is None:
        return "UNKNOWN"
    return found.group()


def stamp(line):
    found = re.search(r"\d{4}-\d{2}-\d{2}", line)
    if found is None:
        return None
    return found.group()


print(level("2041-03-02 ERR north sensor cold"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `import re


def level(line):
    return "UNKNOWN"


def stamp(line):
    return None


print(level("2041-03-02 ERR north sensor cold"))
`,
      'hidden_test.py': importAssert(`assert main.level("2041-03-02 ERR north sensor cold") == "ERR"
assert main.level("2041-03-02 WARN east damp") == "WARN"
assert main.level("2041-03-02 INFO west dry") == "INFO"
assert main.level("2041-03-02 fox seen") == "UNKNOWN"
assert main.stamp("2041-03-02 ERR north") == "2041-03-02"
assert main.stamp("1999-12-31 INFO west") == "1999-12-31"
assert main.stamp("no date here") is None`)
    }
  })

  out.push({
    doc: lesson({
      id: 'regex-groups-and-sub',
      courseId: 'text',
      moduleId: 'patterns',
      title: 'Capture the parts, replace the rest',
      skillIds: ['python.text.regex'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'Brackets remember what they matched',
          idea:
            'Round brackets in a pattern do two jobs at once: they group, and they **capture**. Every captured piece is available afterwards as `found.group(1)`, `found.group(2)` and so on, with `group(0)` holding the whole match. Naming them with `(?P<name>...)` swaps the counting for something you can read.',
          bites:
            'This bites when you count groups by hand and a bracket you added for grouping shifts every number after it. Named groups sidestep the problem entirely, and `found.groupdict()` hands the whole set back as a dictionary, which is usually the shape you wanted anyway.',
          code: String.raw`import re

line = "2041-03-02 ERR north sensor cold"

found = re.search(r"(\d{4})-(\d{2})-(\d{2})", line)
print(found.group(0))        # '2041-03-02' - the whole match
print(found.group(1))        # '2041'

named = re.search(r"(?P<level>ERR|WARN|INFO) (?P<zone>\w+)", line)
print(named.group("zone"))   # 'north'
print(named.groupdict())     # {'level': 'ERR', 'zone': 'north'}

print(re.sub(r"\d{4}-\d{2}-\d{2}", "<date>", line))`,
          mistake:
            'A common mistake is expecting `re.sub` to edit the string in place. It returns a new string, like every other text operation, and the original is unchanged until you assign the result. The exercise asks you to pull three named fields out of a log line and to redact the date out of another.'
        }),
        check(
          'group-zero',
          '`found.group(0)` gives you…',
          [
            { id: 'whole', md: 'The whole matched text' },
            { id: 'first', md: 'The first captured bracket' },
            { id: 'error', md: 'An `IndexError` — groups start at 1' }
          ],
          'whole',
          {
            explainMd:
              'Group zero is the entire span the pattern matched, and the numbered groups start at one, counted by the position of their opening bracket. Calling `.group()` with no argument is the same as `.group(0)`, which is why it prints the whole match.'
          }
        ),
        tf(
          'sub-returns',
          '`re.sub(pattern, replacement, line)` returns a new string and leaves `line` unchanged.',
          true,
          {
            explainMd:
              'Strings are immutable, so every regex replacement builds a new one. If you want the change to stick you write `line = re.sub(...)`. The count of replacements is available too, from `re.subn`, which returns the new string and the number of substitutions as a pair.'
          }
        ),
        pyCode({
          id: 'groups-and-redact',
          prompt:
            '> Write `parse(line)` returning `{"stamp": ..., "level": ..., "zone": ...}` using **named** groups, or `None` when the line does not match. Write `redact(line)` replacing any date with `<date>`.',
          equals: '<date> ERR north',
          hidden: true,
          hints: ladder(
            'The starter hands the line straight back from `redact`, so the date is still there, and `parse` never even looks at its argument.',
            'Name each piece with `(?P<name>...)` and read them all at once with `found.groupdict()`. For the redaction, `re.sub` takes the pattern, the text to put in its place, and the line.',
            'With `found = re.search(r"(?P<a>\\w+)-(?P<b>\\w+)", "fox-owl")`, `found.groupdict()` is `{"a": "fox", "b": "owl"}`.',
            String.raw`import re


def parse(line):
    found = re.search(r"(?P<stamp>\d{4}-\d{2}-\d{2}) (?P<level>[A-Z]+) (?P<zone>\w+)", line)
    if found is None:
        return None
    return found.groupdict()


def redact(line):
    return re.sub(r"\d{4}-\d{2}-\d{2}", "<date>", line)


print(redact("2041-03-02 ERR north"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `import re


def parse(line):
    return None


def redact(line):
    return line


print(redact("2041-03-02 ERR north"))
`,
      'hidden_test.py': importAssert(`got = main.parse("2041-03-02 ERR north sensor cold")
assert got == {"stamp": "2041-03-02", "level": "ERR", "zone": "north"}
assert main.parse("1999-12-31 WARN east") == {"stamp": "1999-12-31", "level": "WARN", "zone": "east"}
assert main.parse("nothing useful here") is None
assert main.redact("2041-03-02 ERR north") == "<date> ERR north"
assert main.redact("no date") == "no date"
assert main.redact("2041-03-02 and 1999-12-31") == "<date> and <date>"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'encoding-bytes-vs-str',
      courseId: 'text',
      moduleId: 'patterns',
      title: 'Text is not storage',
      skillIds: ['python.values.strings'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Two types, one conversion in each direction',
          idea:
            'A `str` is text: a sequence of characters, with no opinion about how they are stored. A `bytes` is storage: a sequence of numbers from 0 to 255, with no opinion about what they mean. `encode` turns text into bytes and `decode` turns bytes back into text, and both need to be told which encoding to use.',
          bites:
            'This bites the moment a character needs more than one byte. In UTF-8 an accented letter takes two bytes and many symbols take three, so `len(text)` and `len(text.encode("utf-8"))` disagree. Code that measures the wrong one truncates a file in the middle of a character and produces bytes nothing can decode.',
          code: String.raw`text = "caf\u00e9"          # four characters: c, a, f, e-with-accent
raw = text.encode("utf-8")  # five bytes: the accent takes two

print(type(raw).__name__)   # bytes
print(len(text), len(raw))  # 4 5
print(raw.decode("utf-8") == text)   # True
print("fox".encode("utf-8"))         # b'fox'`,
          mistake:
            'A common mistake is leaving the encoding out and letting the platform choose. The same program then reads one thing on your machine and another on someone else\'s, and the failure shows up as mangled characters rather than an error. Name UTF-8 every time. The exercise asks you to measure the real storage size and prove a round trip.'
        }),
        check(
          'bytes-vs-str',
          '`"fox".encode("utf-8")` gives you…',
          [
            { id: 'bytes', md: 'A `bytes` object' },
            { id: 'str', md: 'Another `str`' },
            { id: 'list', md: 'A list of integers' }
          ],
          'bytes',
          {
            explainMd:
              '`encode` always produces `bytes`, which display with a `b` prefix as `b\'fox\'`. It is a distinct type, not a string that looks odd: you cannot concatenate it with a `str`, and doing so raises `TypeError` rather than converting silently.'
          }
        ),
        tf(
          'name-the-codec',
          'Naming the encoding explicitly, as in `text.encode("utf-8")`, is safer than relying on the platform default.',
          true,
          {
            explainMd:
              'The default depends on the operating system and its locale, so the same code can behave differently on two machines and the mismatch shows up as corrupted characters rather than an exception. UTF-8 handles every character and is the sane default to state out loud.'
          }
        ),
        pyCode({
          id: 'measure-the-bytes',
          prompt:
            '> Write `byte_length(text)` returning how many **bytes** the text takes in UTF-8, and `roundtrip(text)` returning the text after an encode and a decode. Print `byte_length("caf\\u00e9")`.',
          equals: '5',
          hidden: true,
          hints: ladder(
            'The starter prints `4`, which is the number of characters. The accented letter is one character and more than one byte, so the two counts are not the same thing.',
            'Encode the text first and measure that: `len(text.encode("utf-8"))`. For the round trip, encode and then decode with the same encoding named on both sides.',
            'For `"na\\u00efve"` there are five characters but six bytes in UTF-8, because the dotted letter takes two.',
            `def byte_length(text):
    return len(text.encode("utf-8"))


def roundtrip(text):
    return text.encode("utf-8").decode("utf-8")


print(byte_length("caf\\u00e9"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `def byte_length(text):
    return len(text)


def roundtrip(text):
    return text


print(byte_length("caf\\u00e9"))
`,
      'hidden_test.py': importAssert(`assert main.byte_length("fox") == 3
assert main.byte_length("") == 0
assert main.byte_length("caf\\u00e9") == 5
assert main.byte_length("na\\u00efve") == 6
assert main.roundtrip("caf\\u00e9") == "caf\\u00e9"
assert main.roundtrip("fox") == "fox"
assert isinstance(main.roundtrip("fox"), str)`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-clean-a-log',
      courseId: 'text',
      moduleId: 'patterns',
      title: 'Transfer: clean the station log',
      skillIds: ['python.values.strings', 'python.text.regex'],
      estimatedMinutes: 22,
      mastery: { requiresTransfer: true },
      creation: {
        id: 'log-scrubber',
        step: 1,
        briefMd:
          'Step one of the log scrubber. Nobody at the field station writes the log the same way twice: stray spaces, shouted levels, blank lines, and notes to self starting with a hash. This step builds the normaliser — one function that turns a messy line into the one canonical form, and one that runs it over a whole log and drops what is not a record. The next step in the creation gives it a real file to read and a report to write.'
      },
      blocks: [
        teach({
          heading: 'One canonical shape, chosen up front',
          idea:
            'Cleaning text is not a pile of tweaks; it is a decision about what the tidy version looks like, followed by the steps that get there. Decide the shape first — what is trimmed, what case each field is in, what counts as a record at all — and every line either reaches that shape or is dropped.',
          bites:
            'This bites when the steps run in an order that undoes each other. Collapsing internal whitespace before trimming the ends leaves a leading space behind; lowercasing the whole line first destroys a field you wanted upper case. The order is part of the rule, not an implementation detail.',
          code: String.raw`import re

messy = "   fox   Seen  NEAR  the  creek "

tidy = re.sub(r"\s+", " ", messy.strip())
print(repr(tidy))         # 'fox Seen NEAR the creek'
print(tidy.split(" ", 1)) # ['fox', 'Seen NEAR the creek'] - one split, two parts

print(bool("# note".startswith("#")))   # True - not a record`,
          mistake:
            'A common mistake is assuming every line has the fields you expect and letting `split` unpack straight into three names, which raises `ValueError` on the first short line. The exercise asks you to normalise real station log lines: trim, collapse runs of spaces, shout the level, quieten the message, and drop blanks, comments, and anything too short to be a record.'
        }),
        predict(
          'order-matters',
          'You collapse runs of whitespace before trimming the ends. What does `"  fox   seen  "` become?',
          [
            { id: 'clean', md: "`'fox seen'`" },
            { id: 'spaced', md: "`' fox seen '` — the outer spaces each collapsed to one and stayed" }
          ],
          'spaced',
          {
            explainMd:
              'Collapsing turns each run into a single space, including the runs at the two ends, so a lone space survives on each side. Trimming first removes the ends entirely and then the collapse only has internal runs left to deal with — same two steps, different result.'
          }
        ),
        check(
          'drop-what',
          'Which lines should a log normaliser drop rather than clean?',
          [
            { id: 'nonrecords', md: 'Blank lines, comment lines, and lines with too few fields to be a record' },
            { id: 'upper', md: 'Any line that is already upper case' },
            { id: 'long', md: 'Any line longer than eighty characters' }
          ],
          'nonrecords',
          {
            explainMd:
              'A normaliser has two answers: here is the canonical form, or this was never a record. Blanks and comments are the obvious second case, and so is a line too short to have the fields the shape requires — cleaning that one would invent data that was not there.'
          }
        ),
        pyCode({
          id: 'clean-the-log',
          prompt:
            '> Write `clean_line(line)` returning `"<stamp> <LEVEL> <rest in lower case>"` or `None` for a blank line, a `#` comment, or a line with fewer than three fields. Then write `clean_log(lines)` returning only the cleaned records.',
          equals: "['2041-03-02 ERR north sensor cold', '2041-03-02 WARN east damp']",
          hidden: true,
          hints: ladder(
            'The starter returns every line exactly as it came in, comments and blanks included, so the printed list is still the mess you started with.',
            'In `clean_line`: strip first, return `None` for an empty result or one starting with `#`, then collapse runs of whitespace with `re.sub`. Split into at most three parts, return `None` if you got fewer, and rebuild with the level upper case and the rest lower case.',
            'A two-step split is the useful one here: `"a b c d".split(" ", 2)` gives `["a", "b", "c d"]`, so the third piece keeps its own spaces.',
            String.raw`import re


def clean_line(line):
    text = line.strip()
    if not text or text.startswith("#"):
        return None
    text = re.sub(r"\s+", " ", text)
    parts = text.split(" ", 2)
    if len(parts) < 3:
        return None
    stamp, level, rest = parts
    return f"{stamp} {level.upper()} {rest.lower()}"


def clean_log(lines):
    out = []
    for line in lines:
        cleaned = clean_line(line)
        if cleaned is not None:
            out.append(cleaned)
    return out


RAW = [
    "  2041-03-02   err   North Sensor COLD  ",
    "# maintenance note",
    "",
    "2041-03-02 warn East Damp",
]
print(clean_log(RAW))`
          )
        })
      ]
    }),
    files: {
      'main.py': `import re


def clean_line(line):
    return line


def clean_log(lines):
    return lines


RAW = [
    "  2041-03-02   err   North Sensor COLD  ",
    "# maintenance note",
    "",
    "2041-03-02 warn East Damp",
]
print(clean_log(RAW))
`,
      'hidden_test.py': importAssert(`assert main.clean_line("  2041-03-02   err   North Sensor COLD  ") == "2041-03-02 ERR north sensor cold"
assert main.clean_line("2041-03-02 warn East Damp") == "2041-03-02 WARN east damp"
assert main.clean_line("   ") is None
assert main.clean_line("") is None
assert main.clean_line("# note") is None
assert main.clean_line("  # indented note") is None
assert main.clean_line("short line") is None

assert main.clean_log(["", "# x", " 2041-03-02 info West Dry "]) == ["2041-03-02 INFO west dry"]
assert main.clean_log([]) == []
assert main.clean_log(main.RAW) == [
    "2041-03-02 ERR north sensor cold",
    "2041-03-02 WARN east damp",
]`)
    }
  })

  return out
}
