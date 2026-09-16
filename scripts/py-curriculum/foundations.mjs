import {
  lesson,
  teach,
  fence,
  predict,
  check,
  cloze,
  tf,
  reflect,
  ladder,
  pyCode,
  playCode,
  fox,
  beacon,
  rock,
  tree,
  token,
  field,
  gridWorld,
  at,
  importAssert,
  srcIncludes,
  playLogOk
} from './lib.mjs'

export function lessonsFoundations() {
  const out = []

  out.push({
    doc: lesson({
      id: 'py-placement',
      courseId: 'placement',
      moduleId: 'diagnostic',
      title: 'Placement: what Python already does in your head',
      skillIds: ['python.types.names', 'python.control.loops', 'python.collections.list', 'python.functions'],
      estimatedMinutes: 25,
      blocks: [
        teach({
          heading: 'No fox yet',
          idea:
            'Ten short questions about what Python actually does. Nothing here locks you out. A wrong answer only marks which later lesson to take slowly, and you can leave every one of them wrong and still continue.',
          bites:
            'Answer with the result you expect the language to produce, not the result you wish it produced. Most of these are places where a reasonable guess is wrong, which is exactly what makes them worth measuring before you start.',
          code: `print(type(3))        # what does this actually print?
print(10 / 2)         # int or float?
print([1, 2] == [1, 2])`,
          mistake:
            'A common mistake is skipping the battery because it feels like a test. It is not graded; it is a map. Later the same ideas come back as a fox on a grid and as a field-station log you clean up.'
        }),
        check(
          'type-of-int',
          '`type(3)` reports which kind?',
          [
            { id: 'int', md: '`int`' },
            { id: 'number', md: '`number`' },
            { id: 'float', md: '`float`' }
          ],
          'int',
          {
            diagnostic: true,
            skillIds: ['python.types.names'],
            explainMd:
              'Python has no single `number` kind. A whole number is an `int` and a decimal is a `float`, and the two behave differently when you divide them. Knowing which one you hold is how you predict the result of `/` and `//`.'
          }
        ),
        check(
          'true-division',
          '`10 / 2` evaluates to…',
          [
            { id: 'five-int', md: '`5` — a whole number', misconceptionId: 'slash-is-integer-division' },
            { id: 'five-float', md: '`5.0` — a float' }
          ],
          'five-float',
          {
            diagnostic: true,
            skillIds: ['python.values.numbers'],
            explainMd:
              '`/` is true division and always hands back a float, even when the answer divides evenly. `10 / 2` is `5.0`. The operator that keeps a whole number is `//`, which floors the result: `10 // 3` is `3`.'
          }
        ),
        check(
          'string-upper',
          '`name = "ada"` then `name.upper()` — what is `name` afterwards?',
          [
            { id: 'shout', md: '`"ADA"` — the method changed it', misconceptionId: 'strings-mutate-in-place' },
            { id: 'same', md: '`"ada"` — the method returned a new string' }
          ],
          'same',
          {
            diagnostic: true,
            skillIds: ['python.values.strings'],
            explainMd:
              'Strings are immutable. `upper()` builds a second string and hands it back; it never rewrites the one you called it on. `name` still holds `"ada"` unless you assign the result back with `name = name.upper()`.'
          }
        ),
        check(
          'range-end',
          '`list(range(3))` is…',
          [
            { id: 'inclusive', md: '`[1, 2, 3]`', misconceptionId: 'range-is-inclusive' },
            { id: 'exclusive', md: '`[0, 1, 2]`' }
          ],
          'exclusive',
          {
            diagnostic: true,
            skillIds: ['python.control.loops'],
            explainMd:
              '`range` starts at 0 and stops *before* the end value, so `range(3)` yields 0, 1, 2 — three items. This is why `range(len(items))` walks every index exactly once, and why an off-by-one bug usually means you added a `+ 1` that was never needed.'
          }
        ),
        check(
          'list-alias',
          '`a = [1]` then `b = a` then `b.append(2)` — what is `a`?',
          [
            { id: 'one', md: '`[1]` — b was a copy', misconceptionId: 'assignment-copies-a-list' },
            { id: 'two', md: '`[1, 2]` — both names point at one list' }
          ],
          'two',
          {
            diagnostic: true,
            skillIds: ['python.collections.list'],
            explainMd:
              'Assignment binds another name to the *same* list; it does not copy anything. `a` and `b` are two labels on one object, so appending through either name is visible through both. `b = a.copy()` or `b = list(a)` is what makes a separate list.'
          }
        ),
        check(
          'dict-missing',
          '`{"a": 1}["b"]` does what?',
          [
            { id: 'none', md: 'Returns `None`', misconceptionId: 'missing-key-returns-none' },
            { id: 'raises', md: 'Raises `KeyError`' }
          ],
          'raises',
          {
            diagnostic: true,
            skillIds: ['python.collections.dict'],
            explainMd:
              'Square brackets on a missing key raise `KeyError`. The method that returns `None` instead — or any default you name — is `.get()`: `{"a": 1}.get("b")` is `None` and `.get("b", 0)` is `0`.'
          }
        ),
        check(
          'return-vs-print',
          'A function that only calls `print` and has no `return` gives back…',
          [
            { id: 'text', md: 'The text it printed', misconceptionId: 'print-is-the-program' },
            { id: 'none', md: '`None`' }
          ],
          'none',
          {
            diagnostic: true,
            skillIds: ['python.functions'],
            explainMd:
              'Printing writes to the screen; returning hands a value back to the caller. A function with no `return` gives back `None`, which is why `print(greet("Ada"))` can show the greeting and then `None` on the next line when `greet` printed instead of returning.'
          }
        ),
        check(
          'mutable-default',
          '`def add(x, bag=[]): bag.append(x); return bag` — calling `add(1)` twice gives…',
          [
            { id: 'fresh', md: '`[1]` both times', misconceptionId: 'mutable-default-is-fresh' },
            { id: 'shared', md: '`[1]` then `[1, 1]`' }
          ],
          'shared',
          {
            diagnostic: true,
            skillIds: ['python.functions'],
            explainMd:
              'The default value is built **once**, when the `def` runs — not on every call. Every call that does not pass `bag` shares that one list, so it grows. The fix is `bag=None` plus `if bag is None: bag = []` inside the function.'
          }
        ),
        check(
          'is-vs-equals',
          'For two separate lists with the same contents, `a == b` and `a is b` are…',
          [
            { id: 'same', md: 'Both `True` — same contents means same object', misconceptionId: 'is-means-equals' },
            { id: 'split', md: '`==` is `True`, `is` is `False`' }
          ],
          'split',
          {
            diagnostic: true,
            skillIds: ['python.values.truth'],
            explainMd:
              '`==` compares contents; `is` asks whether two names point at the very same object in memory. Two lists built separately can be equal without being identical. Reserve `is` for `None`, `True`, and `False`.'
          }
        ),
        check(
          'generator-reuse',
          'A generator you have already looped over, looped a second time, yields…',
          [
            { id: 'again', md: 'The same items again', misconceptionId: 'generator-is-a-list' },
            { id: 'nothing', md: 'Nothing — it is exhausted' }
          ],
          'nothing',
          {
            diagnostic: true,
            skillIds: ['python.internals.iteration'],
            explainMd:
              'A generator produces items once and keeps no history, so a second loop sees an empty stream. That is the price of not holding everything in memory. Wrap it in `list(...)` when you genuinely need to walk the items more than once.'
          }
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'names-and-values',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Names hold values',
      skillIds: ['python.types.names'],
      estimatedMinutes: 12,
      taskRev: 2,
      blocks: [
        teach({
          heading: 'A name is a sticky note',
          idea:
            'A name is a sticky note you press onto a value once the work is done. The note does not do the arithmetic. It remembers the result so the rest of the program can use it without repeating the calculation.',
          bites:
            'This bites when you print a literal instead of a name. The screen looks right once, but nothing stored the answer, so the next line cannot use it and a later change leaves a stale digit on the screen.',
          code: `total = 3 + 4
print(total)     # 7 — because total holds the result`,
          mistake:
            'A common mistake is treating `print` as the storage. Printing shows a value and then forgets it. The exercise asks you to add `3 + 4` into the name `total` and print that name, so the `7` comes from the binding rather than from a digit you typed.'
        }),
        predict(
          'what-prints',
          'After `total = 3 + 4`, what does `print(total)` show?',
          [
            { id: 'expr', md: 'The text `3 + 4`' },
            { id: 'seven', md: '`7`' }
          ],
          'seven',
          {
            explainMd:
              'The right-hand side runs first and produces `7`. The name is then bound to that finished value, so printing the name shows `7`, not the expression that made it.'
          }
        ),
        cloze(
          'binding-words',
          'In `total = 3 + 4`, the {{a}} runs first and the {{b}} remembers the result.',
          [
            { id: 'a', choices: ['expression', 'name', 'print'] },
            { id: 'b', choices: ['name', 'expression', 'screen'] }
          ],
          { a: 'expression', b: 'name' },
          {
            explainMd:
              'Python evaluates the right-hand side first and produces one finished value. Only then is the name on the left bound to it, which is why printing the name later shows `7` rather than the expression that made it.'
          }
        ),
        pyCode({
          id: 'make-total',
          prompt: '> Add `3 + 4` into the name `total`, then print that name. Output should be `7`.',
          equals: '7',
          ast: 'total',
          hidden: true,
          hints: ladder(
            'The starter prints a digit directly. Nothing is stored, so nothing can be reused.',
            'Bind the sum to a name first: `name = value`. Then print the name.',
            '`parts = 2 + 5` then `print(parts)` shows `7` from the binding, not from a typed digit.',
            'total = 3 + 4\nprint(total)'
          )
        })
      ]
    }),
    files: {
      'main.py': `print(7)
`,
      'hidden_test.py': srcIncludes('total')
    }
  })

  out.push({
    doc: lesson({
      id: 'types-you-can-see',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Kinds you can print',
      skillIds: ['python.types.names'],
      estimatedMinutes: 14,
      taskRev: 2,
      blocks: [
        teach({
          heading: 'Every value has a kind',
          idea:
            'Every value carries a kind, and `type(value)` reports it. A whole number is an `int`, a decimal is a `float`, quoted characters are a `str`, and a yes-or-no is a `bool`. The kind decides what the operators do next.',
          bites:
            'This bites the first time you add a number to a number-shaped string. `2 + 2` is `4`, but `"2" + "2"` is `"22"`, because `+` joins text and adds numbers. A field-station log that stores `"2"` where it meant `2` fails the moment something sums the column.',
          code: `type(3).__name__        # 'int'
type("3").__name__      # 'str'
type(3.0).__name__      # 'float'
type(True).__name__     # 'bool'`,
          mistake:
            'A common mistake is trusting how a value *looks* on screen: `print(3)` and `print("3")` are identical to the eye. The exercise asks you to write `kind_of(value)` returning the kind name, so a hidden test can ask about several values at once.'
        }),
        predict(
          'quoted-digit',
          'What is `type("3").__name__`?',
          [
            { id: 'int', md: '`int` — it is a digit' },
            { id: 'str', md: '`str` — the quotes make it text' }
          ],
          'str',
          {
            explainMd:
              'Quotes make text, even when the text happens to be a digit. The value is a `str`, so `+` will join it rather than add it.'
          }
        ),
        tf(
          'bool-is-kind',
          '`True` and `False` have their own kind in Python.',
          true,
          { explainMd: '`type(True).__name__` is `bool`. Booleans are their own kind, even though they also behave like 1 and 0 in arithmetic.' }
        ),
        pyCode({
          id: 'kind-of',
          prompt:
            '> Write `kind_of(value)` so it returns the kind **name** as a string — `kind_of(3)` is `"int"`, `kind_of("3")` is `"str"`. Print `kind_of(3)`.',
          equals: 'int',
          ast: 'type',
          hidden: true,
          hints: ladder(
            'The starter always answers the same thing. The value that arrives should decide the answer.',
            '`type(value)` gives the type object; `.__name__` turns that into the plain string you want to return.',
            '`type(3.5).__name__` is `"float"`, so the same expression works for every kind without an if-chain.',
            'def kind_of(value):\n    return type(value).__name__\n\n\nprint(kind_of(3))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def kind_of(value):
    return "?"


print(kind_of(3))
`,
      'hidden_test.py': importAssert(`assert main.kind_of(3) == "int"
assert main.kind_of("3") == "str"
assert main.kind_of(3.5) == "float"
assert main.kind_of(True) == "bool"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'numbers-int-float',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Whole, or not quite whole',
      skillIds: ['python.values.numbers'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Two ways to be a number',
          idea:
            'Python keeps whole numbers and decimals apart. An `int` is a count of things — crates, steps, sensors — and a `float` is a measurement that may land between the marks. The operator you pick decides which kind you get back, so the kind is a choice you make rather than something the value decides for you.',
          bites:
            'This bites the first time you divide. `/` is true division and always hands back a float, even when the answer is exact, so a crate count quietly becomes `3.4` and then `4.0` and then a label that reads `4.0 crates`. Floats also carry a tiny rounding error, because a decimal fraction has no exact binary form, which is why `0.1 + 0.2` is not quite `0.3`.',
          code: `print(7 / 2)        # 3.5  — true division, always a float
print(7 // 2)       # 3    — floor division keeps the whole part
print(7 % 2)        # 1    — the remainder that did not fit
print(0.1 + 0.2)    # 0.30000000000000004`,
          mistake:
            'A common mistake is reaching for `/` when you meant "how many fit". The station packs readings into boxes, and half a box is not a thing. The exercise asks you to hand back the number of full boxes and the leftovers, so pick the operator that keeps whole numbers instead of the one that looks like division on paper.'
        }),
        predict(
          'ten-over-five',
          'What does `print(10 / 5)` show?',
          [
            { id: 'two-int', md: '`2` — it divides evenly, so it stays whole', misconceptionId: 'slash-is-integer-division' },
            { id: 'two-float', md: '`2.0`' }
          ],
          'two-float',
          {
            explainMd:
              '`/` is true division and its answer is a float every time, even when nothing is left over. `10 / 5` is `2.0`, not `2`. If you want the whole-number answer, `10 // 5` gives `2` as an `int`, and `10 % 5` gives the `0` that was left behind.'
          }
        ),
        check(
          'floor-and-rest',
          '`17 // 5` and `17 % 5` are…',
          [
            { id: 'three-two', md: '`3` and `2`' },
            { id: 'four-three', md: '`4` and `3`' },
            { id: 'three-four', md: '`3.4` and `2`' }
          ],
          'three-two',
          {
            explainMd:
              '`//` floors: five fits into seventeen three whole times, so `17 // 5` is `3`. `%` reports what is left over after those three, which is `2`. Together they say "three full boxes and two readings loose", and `3 * 5 + 2` gets you back to `17`.'
          }
        ),
        tf(
          'float-exact',
          '`0.1 + 0.2 == 0.3` is `True` in Python.',
          false,
          {
            explainMd:
              'It is `False`. A float stores a binary fraction, and `0.1` has no exact binary form, so the sum lands on `0.30000000000000004`. This is not a Python bug — it is how almost every language stores decimals. Compare measurements with a tolerance, or use whole units, rather than testing floats for exact equality.'
          }
        ),
        pyCode({
          id: 'pack-the-boxes',
          prompt:
            '> The station packs `total` readings into boxes of `per_box`. Finish `boxes_and_rest(total, per_box)` so it returns `(full_boxes, leftover)` as two whole numbers. The printed line should be `3 2`.',
          equals: '3 2',
          ast: '//',
          misconceptionId: 'slash-is-integer-division',
          hidden: true,
          hints: ladder(
            'Look at what the starter prints. `3.4` is not a number of boxes — the operator handed back a float.',
            '`//` divides and floors, so it answers "how many whole ones fit". `%` answers "what was left over".',
            '`13 // 4` is `3` and `13 % 4` is `1`: three full groups of four, one straggler.',
            'def boxes_and_rest(total, per_box):\n    return (total // per_box, total % per_box)\n\n\nboxes, rest = boxes_and_rest(17, 5)\nprint(boxes, rest)'
          )
        })
      ]
    }),
    files: {
      'main.py': `def boxes_and_rest(total, per_box):
    return (total / per_box, total % per_box)


boxes, rest = boxes_and_rest(17, 5)
print(boxes, rest)
`,
      'hidden_test.py': importAssert(`assert main.boxes_and_rest(17, 5) == (3, 2)
assert main.boxes_and_rest(9, 3) == (3, 0)
assert main.boxes_and_rest(4, 10) == (0, 4)
boxes, rest = main.boxes_and_rest(17, 5)
assert isinstance(boxes, int) and isinstance(rest, int), "both parts must be whole numbers"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'strings-immutable',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'A string method hands you a new string',
      skillIds: ['python.values.strings'],
      estimatedMinutes: 15,
      blocks: [
        teach({
          heading: 'Text you cannot edit in place',
          idea:
            'A string in Python is frozen once it exists. Every method that looks like it edits text — `upper`, `strip`, `replace` — actually builds a second string and hands that back. The original is untouched, which is why a string is safe to pass around: nobody can change it behind your back.',
          bites:
            'This bites when you call the method and walk away. The line runs, the new string is built, and then it is dropped on the floor because nothing caught it. The station log is full of tags with stray spaces, and a cleanup pass that forgets to assign the result leaves every one of them exactly as messy as before.',
          code: `tag = "  north gate  "
tag.strip()          # builds "north gate" and throws it away
print(tag)           # '  north gate  ' — unchanged

tag = tag.strip()    # catch the new string
print(tag)           # 'north gate'`,
          mistake:
            'A common mistake is expecting the method call alone to fix the value. Nothing in Python edits a string where it stands. The exercise asks you to clean a log tag and hand the cleaned version back, so make sure the value you return is the one the methods produced, not the one you were given.'
        }),
        predict(
          'upper-then-print',
          '`name = "ada"`, then `name.upper()`, then `print(name)`. What appears?',
          [
            { id: 'shouted', md: '`ADA` — the method changed `name`', misconceptionId: 'strings-mutate-in-place' },
            { id: 'quiet', md: '`ada`' }
          ],
          'quiet',
          {
            explainMd:
              '`upper()` returns a brand new string and leaves `name` alone, so `name` still holds `"ada"`. The uppercase copy existed for a moment and then had no name pointing at it, so it was discarded. Writing `name = name.upper()` is what makes the change stick.'
          }
        ),
        cloze(
          'method-words',
          'A string method {{a}} the original and {{b}} a new string.',
          [
            { id: 'a', choices: ['leaves alone', 'rewrites', 'deletes'] },
            { id: 'b', choices: ['returns', 'prints', 'ignores'] }
          ],
          { a: 'leaves alone', b: 'returns' },
          {
            explainMd:
              'Strings are immutable, so no method can rewrite one. Each method reads the original, builds a separate string from it, and returns that. If you do not assign or return the result, the work is simply lost, which is the single most common string bug for a new Python programmer.'
          }
        ),
        pyCode({
          id: 'clean-the-tag',
          prompt:
            '> Finish `shout(tag)` so it trims the stray spaces off a log tag and hands back the uppercase version. `shout("  fox-den  ")` should be `"FOX-DEN"`.',
          equals: 'FOX-DEN',
          ast: '.strip()',
          misconceptionId: 'strings-mutate-in-place',
          hidden: true,
          hints: ladder(
            'The starter calls two methods and then returns the value it was handed. Nothing caught what those methods built.',
            'Each method returns a new string. Either assign each result back to the name, or chain them and return the end of the chain.',
            '`line = "  owl  ".strip().title()` gives `"Owl"`, because each call works on what the previous one returned.',
            'def shout(tag):\n    return tag.strip().upper()\n\n\nprint(shout("  fox-den  "))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def shout(tag):
    tag.strip()
    tag.upper()
    return tag


print(shout("  fox-den  "))
`,
      'hidden_test.py': importAssert(`assert main.shout("  fox-den  ") == "FOX-DEN"
assert main.shout("owl") == "OWL"
assert main.shout("   north gate ") == "NORTH GATE"
assert main.shout("") == ""`)
    }
  })

  out.push({
    doc: lesson({
      id: 'say-it-once',
      courseId: 'values',
      moduleId: 'kinds',
      title: 'Say it once',
      skillIds: ['python.values.strings', 'python.io.stdio'],
      estimatedMinutes: 16,
      creation: {
        id: 'greeting-bot',
        step: 1,
        briefMd:
          'Step one of the greeting bot: one sentence, written once, with the name dropped into the middle of it. Later steps add the checks that keep it sensible when the name is missing.'
      },
      blocks: [
        teach({
          heading: 'One sentence, one place to change it',
          idea:
            'An f-string is a normal string with an `f` in front, and any `{ }` inside it is an expression that Python works out and drops into the text. The sentence stays readable because the words and the values sit where they will actually appear.',
          bites:
            'This bites when you build the sentence out of `+` instead. You end up counting spaces by hand, converting numbers with `str()`, and repeating the same greeting in three places, so a wording change means three edits and one of them gets missed. The station greets everyone who signs in, and a greeting that says `Hello, name!` because the quotes swallowed the variable is worse than no greeting at all.',
          code: `crates = 4
where = "north gate"

print("There are " + str(crates) + " crates at " + where + ".")
print(f"There are {crates} crates at {where}.")
print(f"Half of them is {crates / 2}.")`,
          mistake:
            'A common mistake is writing the placeholder inside a plain string and wondering why the literal word appears. Without the `f` prefix, `{name}` is just four characters plus braces. The exercise asks you to write the welcome sentence once and let the name arrive through the braces.'
        }),
        predict(
          'fstring-math',
          'With `crates = 4`, what does `print(f"{crates + 1} left")` show?',
          [
            { id: 'literal', md: '`crates + 1 left`' },
            { id: 'computed', md: '`5 left`' }
          ],
          'computed',
          {
            explainMd:
              'Everything between the braces is evaluated as ordinary Python before the text is assembled, so `crates + 1` becomes `5` and the result is spliced in. That is also why you never need `str()` inside an f-string: the value is converted to text for you on the way in.'
          }
        ),
        tf(
          'needs-the-f',
          'Without the `f` prefix, `"Hello, {name}!"` still substitutes the value of `name`.',
          false,
          {
            explainMd:
              'It does not. A plain string has no special meaning for braces, so you get the literal characters `{name}` in your output. The `f` is what tells Python to read the braces as expressions, and forgetting it is the most common reason a greeting prints the variable name instead of the person.'
          }
        ),
        pyCode({
          id: 'welcome-line',
          prompt:
            '> Finish `welcome(name)` so it returns `Hello, Ada! Welcome to the field station.` for `"Ada"` — the sentence written once, with the name interpolated.',
          equals: 'Hello, Ada! Welcome to the field station.',
          ast: 'f"',
          hidden: true,
          hints: ladder(
            'The starter prints the word `name` because the placeholder is inside an ordinary string.',
            'Put `f` immediately before the opening quote, then wrap the parameter in braces where the name belongs.',
            '`f"Signed in: {who}"` with `who = "Rune"` gives `Signed in: Rune`.',
            'def welcome(name):\n    return f"Hello, {name}! Welcome to the field station."\n\n\nprint(welcome("Ada"))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def welcome(name):
    return "Hello, name! Welcome to the field station."


print(welcome("Ada"))
`,
      'hidden_test.py': importAssert(`assert main.welcome("Ada") == "Hello, Ada! Welcome to the field station."
assert main.welcome("Rune") == "Hello, Rune! Welcome to the field station."`)
    }
  })

  out.push({
    doc: lesson({
      id: 'truthiness-and-none',
      courseId: 'values',
      moduleId: 'compare',
      title: 'Empty, missing, and false',
      skillIds: ['python.values.truth'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Three different kinds of nothing',
          idea:
            'Every value in Python can stand in a condition, and Python has a short list of values it treats as false: `0`, `0.0`, `""`, the empty list `[]`, the empty dict `{}`, and `None`. Everything else is true, including `"0"`, `"False"`, and `[0]`, because those all contain something.',
          bites:
            'This bites when you collapse "missing" and "empty" and "zero" into one test. A sensor that reported `0` is working perfectly; a sensor that reported nothing at all is broken. `if not reading` cannot tell those apart, so the station report marks a healthy zero-degree reading as a fault.',
          code: `print(bool(0), bool(""), bool([]), bool(None))   # False False False False
print(bool("0"), bool([0]), bool(" "))           # True True True
print(None == False)                             # False
print(None is None)                              # True`,
          mistake:
            'A common mistake is thinking `None` is another spelling of `False`. They are different values of different kinds: `None` means "there is no value here" and `False` is a real answer to a yes-or-no question. The exercise asks you to label a reading, so test for `None` first and only then ask whether what remains is empty.'
        }),
        predict(
          'none-equals-false',
          'What does `print(None == False)` show?',
          [
            { id: 'yes', md: '`True` — both are falsy, so they are equal', misconceptionId: 'none-is-false-value' },
            { id: 'no', md: '`False`' }
          ],
          'no',
          {
            explainMd:
              'Falsy and equal are two different questions. `None` and `False` both make an `if` take the other branch, but they are not the same value, so `==` says `False`. Test for absence with `value is None` and keep `False` for genuine yes-or-no answers.'
          }
        ),
        check(
          'which-is-truthy',
          'Which of these is **true** in a condition?',
          [
            { id: 'zero-str', md: '`"0"`' },
            { id: 'empty-list', md: '`[]`' },
            { id: 'zero', md: '`0`' }
          ],
          'zero-str',
          {
            explainMd:
              '`"0"` is a one-character string, and any string with characters in it is truthy — Python does not look at what the characters say. The empty list and the number zero are both on the short falsy list, so they send an `if` down the else branch.'
          }
        ),
        pyCode({
          id: 'label-the-reading',
          prompt:
            '> Finish `label(value)` so it returns `"missing"` when the reading is `None`, `"empty"` when it is falsy but present (like `0` or `""`), and `"ok"` otherwise. The printed line should be `empty`.',
          equals: 'empty',
          ast: 'is None',
          misconceptionId: 'none-is-false-value',
          hidden: true,
          hints: ladder(
            'The starter asks one question, so it cannot give three answers. A zero reading is reported as missing.',
            'Ask about absence before you ask about emptiness: `value is None` is the only test that separates "no reading" from "a reading of nothing".',
            '`if temp is None: return "no sensor"` runs before any `if not temp:` line, so a genuine `0` never reaches the second test.',
            'def label(value):\n    if value is None:\n        return "missing"\n    if not value:\n        return "empty"\n    return "ok"\n\n\nprint(label(0))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def label(value):
    if not value:
        return "missing"
    return "ok"


print(label(0))
`,
      'hidden_test.py': importAssert(`assert main.label(None) == "missing"
assert main.label(0) == "empty"
assert main.label("") == "empty"
assert main.label([]) == "empty"
assert main.label("fox") == "ok"
assert main.label(3) == "ok"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'compare-is-not-assign',
      courseId: 'values',
      moduleId: 'compare',
      title: 'One equals sign binds, two ask',
      skillIds: ['python.control.if', 'python.types.names'],
      estimatedMinutes: 14,
      blocks: [
        teach({
          heading: 'A statement and a question look almost the same',
          idea:
            'A single `=` is a statement: it takes the value on the right and binds it to the name on the left. A double `==` is a question: it compares two values and produces `True` or `False`. One changes the program, the other only reports on it.',
          bites:
            'This bites inside a condition, where the two are one keystroke apart. Several languages let you assign inside an `if` and then quietly treat the assigned value as the answer, so the branch always runs and the bug hides for months. Python refuses: an `=` where a comparison belongs is a `SyntaxError` at load time, before a single line of your program runs.',
          code: `count = 3             # bind: the name now holds 3
print(count == 3)     # True  — a question about the value
print(count == 4)     # False
# if count = 3:       # SyntaxError: invalid syntax
print(count)          # still 3 — asking never changed it`,
          mistake:
            'A common mistake is reading the error as "Python is being fussy" and adding parentheses. The message is telling you the line is a statement in a place that needs a value. The exercise asks whether a count has reached the station limit, so the body of the function must ask a question and hand back the answer.'
        }),
        predict(
          'assign-in-if',
          'What happens when you run `if count = 3:` in Python?',
          [
            { id: 'silent', md: 'It sets `count` to 3 and the branch runs', misconceptionId: 'assign-instead-of-compare' },
            { id: 'syntax', md: 'The file fails to load with a `SyntaxError`' }
          ],
          'syntax',
          {
            explainMd:
              'Python will not parse an assignment where a value is expected, so the whole file is rejected before it runs. That refusal is a feature: the bug that always takes the same branch is caught at load time instead of surviving into production. If you really want to bind and test at once, the walrus `:=` is the explicit way to say so.'
          }
        ),
        tf(
          'compare-mutates',
          'Evaluating `count == 3` can change what `count` holds.',
          false,
          {
            explainMd:
              'It cannot. A comparison reads both sides and produces a fresh `True` or `False`; it never rebinds anything. That is why you can test the same expression as often as you like without side effects, and why an `if` condition is safe to read as a plain question about the current state.'
          }
        ),
        pyCode({
          id: 'at-the-limit',
          prompt:
            '> Finish `at_limit(count)` so it returns `True` exactly when `count` has reached `LIMIT`, and `False` otherwise. The printed line should be `True`.',
          equals: 'True',
          ast: '==',
          misconceptionId: 'assign-instead-of-compare',
          hidden: true,
          hints: ladder(
            'The starter binds a name and returns it, so it hands back the limit itself rather than an answer.',
            'A function that answers yes or no should end in a comparison. `==` produces the `True` or `False` you want to return.',
            '`def is_empty(n): return n == 0` returns `True` for `0` and `False` for everything else — no `if` needed.',
            'LIMIT = 5\n\n\ndef at_limit(count):\n    return count == LIMIT\n\n\nprint(at_limit(5))'
          )
        })
      ]
    }),
    files: {
      'main.py': `LIMIT = 5


def at_limit(count):
    reached = LIMIT
    return reached


print(at_limit(5))
`,
      'hidden_test.py': importAssert(`assert main.at_limit(5) is True
assert main.at_limit(4) is False
assert main.at_limit(6) is False
assert main.at_limit(0) is False`)
    }
  })

  out.push({
    doc: lesson({
      id: 'equality-vs-identity',
      courseId: 'values',
      moduleId: 'compare',
      title: 'Same contents, different box',
      skillIds: ['python.values.truth'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Two questions you can ask about two names',
          idea:
            '`==` asks whether two values look the same to anyone reading them. `is` asks something much narrower: whether the two names point at one single object in memory. Two crates packed with identical contents are equal; they are still two crates.',
          bites:
            'This bites because `is` sometimes appears to work. Python reuses small integers and short strings behind the scenes, so `a is b` can come out `True` for `3` and then `False` for `3000`, on the same machine, in the same session. Code that relies on that accident works on your laptop and fails on the station recorder.',
          code: `left = ["fox", "owl"]
right = ["fox", "owl"]
print(left == right)     # True  — same contents
print(left is right)     # False — two separate lists

also = left
print(also is left)      # True  — one list wearing two names
print(left is not None)  # True  — the job is belongs to`,
          mistake:
            'A common mistake is using `is` for value comparison because it reads like English. Reserve `is` for the three singletons — `None`, `True`, `False` — where there is genuinely only ever one object. The exercise asks you to write both questions as separate functions so the difference is impossible to blur.'
        }),
        predict(
          'two-equal-lists',
          'For `left = ["fox"]` and `right = ["fox"]`, what are `left == right` and `left is right`?',
          [
            { id: 'both-true', md: 'Both `True` — equal contents means the same object', misconceptionId: 'is-means-equals' },
            { id: 'split', md: '`True` then `False`' }
          ],
          'split',
          {
            explainMd:
              'Each list literal builds a separate object, so there are two lists here. They compare equal because their contents match, but `is` looks past the contents at the identity of the object itself and reports `False`. Appending to one would leave the other untouched, which is the practical difference.'
          }
        ),
        cloze(
          'pick-the-operator',
          'To ask whether a reading is absent, write `reading {{a}} None`. To ask whether two tags spell the same word, write `one {{b}} two`.',
          [
            { id: 'a', choices: ['is', '==', 'has'] },
            { id: 'b', choices: ['==', 'is', 'in'] }
          ],
          { a: 'is', b: '==' },
          {
            explainMd:
              'There is exactly one `None` object in a running program, so identity is the precise question and `is None` is the idiom every Python reader expects. Strings are values you care about by content, so `==` is right there: two tags typed in different places can be equal without being the same object.'
          }
        ),
        pyCode({
          id: 'two-questions',
          prompt:
            '> Finish `same_object(x, y)` so it answers the identity question, and leave `same_value(x, y)` answering the contents question. For two separately built lists the printed line should be `False True`.',
          equals: 'False True',
          ast: ' is ',
          misconceptionId: 'is-means-equals',
          hidden: true,
          hints: ladder(
            'Both starter functions ask the same question, so they can never disagree. One of them is meant to be stricter.',
            '`is` compares identity — are these the very same object? `==` compares contents. Only one of the two functions should use `is`.',
            '`a = {"n": 1}` and `b = {"n": 1}` give `a == b` as `True` and `a is b` as `False`, for exactly the same reason.',
            'def same_object(x, y):\n    return x is y\n\n\ndef same_value(x, y):\n    return x == y\n\n\nleft = ["fox", "owl"]\nright = ["fox", "owl"]\nprint(same_object(left, right), same_value(left, right))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def same_object(x, y):
    return x == y


def same_value(x, y):
    return x == y


left = ["fox", "owl"]
right = ["fox", "owl"]
print(same_object(left, right), same_value(left, right))
`,
      'hidden_test.py': importAssert(`one = ["fox"]
two = ["fox"]
assert main.same_object(one, two) is False
assert main.same_object(one, one) is True
assert main.same_value(one, two) is True
assert main.same_value(one, ["owl"]) is False
assert main.same_object(None, None) is True`)
    }
  })

  out.push({
    doc: lesson({
      id: 'boolean-logic',
      courseId: 'values',
      moduleId: 'compare',
      title: 'And, or, and the answer you did not expect',
      skillIds: ['python.values.truth'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Three words that combine conditions',
          idea:
            '`and` is true only when both sides are true, `or` is true when at least one side is, and `not` flips whichever answer it is handed. They read like English because they were meant to, and an `if` built from them usually says out loud what the station rule is.',
          bites:
            'This bites in two places. First, both operators short-circuit: `and` stops as soon as it finds something falsy and `or` stops as soon as it finds something truthy, so the right-hand side may never run at all. Second, `or` does not hand back `True` — it hands back one of the two operands, which is why `name or "unnamed"` is the standard way to supply a fallback.',
          code: `def boom():
    raise ValueError("this never runs")


print(True and False)         # False
print(not True)               # False
print(False and boom())       # False — the right side is skipped
print(0 or "unnamed")         # unnamed — an operand, not True
print("fox-den" or "unnamed") # fox-den`,
          mistake:
            'A common mistake is wrapping everything in `bool(...)` because you assumed `or` returns `True`. It returns the first truthy operand, or the last one if none were truthy, and that behaviour is the whole point of the fallback idiom. The exercise asks for a default tag and a two-condition readiness check, so use each operator for what it is good at.'
        }),
        predict(
          'or-returns-operand',
          'What does `print(0 or "unnamed")` show?',
          [
            { id: 'true', md: '`True`' },
            { id: 'text', md: '`unnamed`' }
          ],
          'text',
          {
            explainMd:
              '`or` evaluates the left side, finds `0` is falsy, and moves on to the right side — then hands back that operand itself rather than a boolean. The result is the string `"unnamed"`. Reach for this whenever you want "use what I was given, unless it is empty".'
          }
        ),
        tf(
          'short-circuit',
          'In `False and boom()`, the function `boom()` is never called.',
          true,
          {
            explainMd:
              'True. `and` already knows the answer once it sees a falsy left side, so it stops and never evaluates the right. This is what makes `if items and items[0] == "fox"` safe on an empty list: the index expression is only reached when there is something to index.'
          }
        ),
        pyCode({
          id: 'defaults-and-gates',
          prompt:
            '> Finish `name_or_default(given)` so an empty tag falls back to `"unnamed"`, and fix `can_send(powered, linked)` so it is only true when **both** are true. The printed line should be `unnamed False`.',
          equals: 'unnamed False',
          ast: 'or',
          hidden: true,
          hints: ladder(
            'The starter hands back whatever it was given, and its second function is happy with one condition out of two.',
            '`a or b` gives you `a` unless `a` is falsy, in which case you get `b`. `a and b` needs both sides before it is true.',
            '`port = chosen or 8080` keeps a chosen port and falls back to `8080` when `chosen` is `0`, `None`, or `""`.',
            'def name_or_default(given):\n    return given or "unnamed"\n\n\ndef can_send(powered, linked):\n    return powered and linked\n\n\nprint(name_or_default(""), can_send(True, False))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def name_or_default(given):
    return given


def can_send(powered, linked):
    return powered or linked


print(name_or_default(""), can_send(True, False))
`,
      'hidden_test.py': importAssert(`assert main.name_or_default("") == "unnamed"
assert main.name_or_default("fox-den") == "fox-den"
assert main.name_or_default(None) == "unnamed"
assert main.can_send(True, True) is True
assert main.can_send(True, False) is False
assert main.can_send(False, True) is False`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-classify-value',
      courseId: 'values',
      moduleId: 'compare',
      title: 'Transfer: sort the station log by kind',
      skillIds: ['python.types.names', 'python.values.truth', 'python.values.numbers'],
      estimatedMinutes: 22,
      mastery: { requiresTransfer: true },
      blocks: [
        teach({
          heading: 'The whole course, on one messy log',
          idea:
            'The field station writes one line per reading, and the lines are not tidy. Some are counts, some are measurements, some are switch positions, some are notes typed by hand, and some are the absence of a reading at all. Before anything can be summed or charted, each value has to be sorted into a kind.',
          bites:
            'This bites on one detail the course has been circling: in Python `bool` is a subclass of `int`, so `type(True) is bool` but `isinstance(True, int)` is also true. If your chain asks "is it a whole number?" before "is it a switch?", every `True` in the log is filed as the count `1` and the station reports twice as many crates as it has.',
          code: `print(type(3) is int)        # True
print(type(True) is bool)    # True
print(type(True) is int)     # False — type() asks the exact kind
print(isinstance(True, int)) # True  — but bool inherits from int`,
          mistake:
            'A common mistake is testing for emptiness before testing for absence, which files a missing reading as a blank one. Order your questions from most specific to most general, and let the last line handle everything that survived. The exercise gives you six labels and a log full of values that will try each of them.'
        }),
        predict(
          'bool-before-int',
          'A chain checks `type(v) is int` first and `type(v) is bool` second. What label does `True` get?',
          [
            { id: 'flag', md: 'The bool label — `True` is not an `int`' },
            { id: 'count', md: 'The int label, because the first test already matched' }
          ],
          'flag',
          {
            explainMd:
              '`type(v)` reports the exact kind, and the exact kind of `True` is `bool`, not `int`, so the first test does not match and the value falls through to the bool label. The trap is real with `isinstance`, which follows inheritance and would match the int test first. When ordering matters, `type(...) is ...` is the blunt, predictable tool.'
          }
        ),
        check(
          'order-the-questions',
          'Which question has to come first in the chain?',
          [
            { id: 'none-first', md: '`reading is None`' },
            { id: 'empty-first', md: '`not reading`' },
            { id: 'text-first', md: '`type(reading) is str`' }
          ],
          'none-first',
          {
            explainMd:
              '`None` is falsy, so `not reading` matches it too. If the emptiness test runs first, a missing reading is labelled blank and the station never learns that a sensor went quiet. Asking `is None` first is the only order that keeps "no reading" and "a reading of nothing" apart.'
          }
        ),
        pyCode({
          id: 'classify-reading',
          prompt:
            '> Finish `classify(reading)` so it returns `"missing"` for `None`, `"flag"` for a bool, `"count"` for an int, `"measure"` for a float, `"blank"` for an empty string, and `"text"` for anything else. The printed line should be `measure`.',
          equals: 'measure',
          ast: 'type(',
          hidden: true,
          hints: ladder(
            'Six labels means six decisions. The starter makes none of them, so every reading in the log comes back as text.',
            'Ask `reading is None` first, then `type(reading) is bool`, then the number kinds, then emptiness, and let the final `return` catch the rest.',
            '`if type(v) is float: return "measure"` matches `1.5` and `0.0` but not `1`, because `type()` reports the exact kind rather than a family.',
            'def classify(reading):\n    if reading is None:\n        return "missing"\n    if type(reading) is bool:\n        return "flag"\n    if type(reading) is int:\n        return "count"\n    if type(reading) is float:\n        return "measure"\n    if not reading:\n        return "blank"\n    return "text"\n\n\nprint(classify(1.5))'
          )
        }),
        reflect(
          'why-order',
          'In your own words: why does the order of the questions in `classify` change the answer, and which two pairs of kinds would collide if you shuffled them?'
        )
      ]
    }),
    files: {
      'main.py': `def classify(reading):
    return "text"


print(classify(1.5))
`,
      'hidden_test.py': importAssert(`assert main.classify(None) == "missing"
assert main.classify(True) == "flag"
assert main.classify(False) == "flag"
assert main.classify(3) == "count"
assert main.classify(0) == "count"
assert main.classify(1.5) == "measure"
assert main.classify(0.0) == "measure"
assert main.classify("") == "blank"
assert main.classify("fox-den") == "text"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'if-this-then-that',
      courseId: 'flow',
      moduleId: 'decide',
      title: 'If this, then that',
      skillIds: ['python.control.if'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'A branch, and the whitespace that defines it',
          idea:
            'An `if` runs its body only when the condition is true. `elif` adds another question that is asked only when every question above it came out false, and `else` catches everything that is left. Python tries them top to bottom and stops at the first match, so at most one branch of the chain ever runs.',
          bites:
            'This bites in two ways. Indentation is not decoration here — it is the syntax that says which lines belong to the branch, so a line pulled back to the margin runs every time regardless of the condition. And a chain of separate `if` statements is not the same as `if`/`elif`: separate ifs are all asked, so two of them can both fire and the second answer overwrites the first.',
          code: `level = 42

if level > 80:
    print("high")
elif level > 20:
    print("steady")
else:
    print("low")

print("checked")     # outside the chain — always runs`,
          mistake:
            'A common mistake is leaving a hole in the chain: two branches that cover the extremes and nothing for the middle, so an ordinary value falls through to the wrong answer. The exercise asks for three battery states, so make sure every percentage from 0 to 100 lands on exactly one of them.'
        }),
        predict(
          'which-branch',
          'With `level = 42` in the chain above, what is printed?',
          [
            { id: 'high', md: '`high`' },
            { id: 'steady', md: '`steady`' },
            { id: 'both', md: '`steady` and then `low`' }
          ],
          'steady',
          {
            explainMd:
              '`42 > 80` is false, so the first branch is skipped and Python asks the `elif`. `42 > 20` is true, so `steady` prints and the whole chain ends there — the `else` is never reached. Only one branch of an if/elif/else chain ever runs, no matter how many of the later conditions would also have been true.'
          }
        ),
        cloze(
          'chain-words',
          'A branch body is marked by {{a}}, and a question asked only when the ones above it failed uses {{b}}.',
          [
            { id: 'a', choices: ['indentation', 'braces', 'a semicolon'] },
            { id: 'b', choices: ['elif', 'if', 'else'] }
          ],
          { a: 'indentation', b: 'elif' },
          {
            explainMd:
              'Python uses indentation where other languages use braces, so the four spaces in front of a line are load-bearing syntax rather than style. `elif` chains a further question onto the same decision, which is what guarantees only one branch runs; writing a second plain `if` would ask that question unconditionally.'
          }
        ),
        pyCode({
          id: 'battery-state',
          prompt:
            '> Finish `battery_state(percent)` so it returns `"high"` above 80, `"steady"` above 20, and `"low"` otherwise. The printed line should be `steady`.',
          equals: 'steady',
          ast: 'elif',
          hidden: true,
          hints: ladder(
            'The starter has two answers for three situations, so everything that is not high is reported as low.',
            'Add a middle question with `elif`. It is only asked when the `if` above it was false, so you can write `percent > 20` without repeating `and percent <= 80`.',
            '`if n > 10: return "big"` then `elif n > 0: return "small"` then `return "none"` splits the number line into three without any overlap.',
            'def battery_state(percent):\n    if percent > 80:\n        return "high"\n    elif percent > 20:\n        return "steady"\n    else:\n        return "low"\n\n\nprint(battery_state(42))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def battery_state(percent):
    if percent > 80:
        return "high"
    return "low"


print(battery_state(42))
`,
      'hidden_test.py': importAssert(`assert main.battery_state(95) == "high"
assert main.battery_state(81) == "high"
assert main.battery_state(80) == "steady"
assert main.battery_state(42) == "steady"
assert main.battery_state(21) == "steady"
assert main.battery_state(20) == "low"
assert main.battery_state(0) == "low"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'compare-chaining',
      courseId: 'flow',
      moduleId: 'decide',
      title: 'Between two numbers',
      skillIds: ['python.control.if'],
      estimatedMinutes: 14,
      blocks: [
        teach({
          heading: 'A range check that reads like mathematics',
          idea:
            'Python lets you chain comparisons, so `0 <= x < 10` means exactly what it says on a blackboard: x is at least zero and less than ten. Under the hood Python evaluates it as the two comparisons joined by `and`, but it evaluates the middle expression only once.',
          bites:
            'This bites when the longer spelling drifts. Written out as `0 <= x and x < 10`, the name `x` appears twice, and the day someone changes one of them to `y` the check still runs and still looks plausible. It bites harder when the middle is a call: `0 <= next_reading() < 10` asks the sensor once, while the spelled-out version asks it twice and can compare two different readings.',
          code: `x = 7
print(0 <= x < 10)          # True
print(0 <= x and x < 10)    # True — the longer spelling
print(0 <= 20 < 10)         # False
print(3 < x <= 7)           # True — any mix of < and <=`,
          mistake:
            'A common mistake is checking only the upper edge and forgetting that a coordinate can go negative. The grid has a west wall as well as an east one. The exercise asks whether a coordinate pair is on a 7-by-5 field, so both ends of both axes need a bound.'
        }),
        predict(
          'chained-false',
          'What does `print(0 <= 20 < 10)` show?',
          [
            { id: 'true', md: '`True` — the first comparison holds' },
            { id: 'false', md: '`False`' }
          ],
          'false',
          {
            explainMd:
              'A chain is true only when every link is true. `0 <= 20` holds, but `20 < 10` does not, so the whole expression is `False`. Python stops at the first failing link, which is the same short-circuiting behaviour `and` has, because that is precisely what the chain expands to.'
          }
        ),
        tf(
          'evaluated-once',
          'In `0 <= reading() < 10`, the function `reading()` is called exactly once.',
          true,
          {
            explainMd:
              'True, and this is the real advantage of the chain over the spelled-out form. Python evaluates the middle expression a single time and reuses that value for both comparisons. Writing `0 <= reading() and reading() < 10` calls the sensor twice and can compare two different values, which produces a bug that only appears when the readings change.'
          }
        ),
        pyCode({
          id: 'on-the-grid',
          prompt:
            '> Finish `on_grid(x, y)` so it is `True` only when the cell is inside the 7-by-5 field — both coordinates at least 0, x below `COLS`, y below `ROWS`. The printed line should be `True`.',
          equals: 'True',
          ast: '<=',
          hidden: true,
          hints: ladder(
            'The starter guards the east and south walls but not the west and north ones, so `(-1, 2)` is reported as on the grid.',
            'Each axis needs a lower bound and an upper bound. A chained comparison says both in one expression.',
            '`0 <= hour < 24` rejects `-1` and `24` in one line, without repeating the name `hour` in an `and`.',
            'COLS = 7\nROWS = 5\n\n\ndef on_grid(x, y):\n    return 0 <= x < COLS and 0 <= y < ROWS\n\n\nprint(on_grid(3, 2))'
          )
        })
      ]
    }),
    files: {
      'main.py': `COLS = 7
ROWS = 5


def on_grid(x, y):
    return x < COLS and y < ROWS


print(on_grid(3, 2))
`,
      'hidden_test.py': importAssert(`assert main.on_grid(0, 0) is True
assert main.on_grid(6, 4) is True
assert main.on_grid(3, 2) is True
assert main.on_grid(7, 4) is False
assert main.on_grid(3, 5) is False
assert main.on_grid(-1, 2) is False
assert main.on_grid(2, -1) is False`)
    }
  })

  out.push({
    doc: lesson({
      id: 'walk-the-fox',
      courseId: 'flow',
      moduleId: 'decide',
      title: 'Walk the fox',
      skillIds: ['python.call.move'],
      estimatedMinutes: 15,
      taskRev: 2,
      blocks: [
        teach({
          heading: 'A call is a step',
          idea:
            'A call is one step the fox takes. `Player.move("east")` walks a single cell in the direction you name. East increases **x**, south increases **y**. The beacon never comes to you; you walk onto it.',
          bites:
            'This bites when you expect one call to cover the whole distance, or when you mix the axes and walk north where you meant south. From `(0, 0)`, one east call leaves the fox at `(1, 0)` — not at the origin, and not already on a far beacon.',
          code: `Player.move("east")
Player.move("east")
Player.move("east")
Player.move("south")
Player.move("south")`,
          mistake:
            'A common mistake is passing coordinates instead of a direction, or stopping after one step. The exercise asks you to walk from `(0, 0)` onto the beacon at `(3, 2)`: three east calls and two south calls, in any order.'
        }),
        predict(
          'where-after-east',
          'The fox starts at `(0, 0)`. After one `Player.move("east")`, where is it?',
          [
            { id: 'same', md: 'Still at `(0, 0)`' },
            { id: 'east', md: 'At `(1, 0)`' }
          ],
          'east',
          {
            explainMd:
              'One call is one cell. East adds 1 to x, so the fox lands on `(1, 0)` and waits there for the next call. Nothing moves the fox except a call you wrote, and no single call ever covers the whole distance.'
          }
        ),
        cloze(
          'axis-words',
          'Moving east changes {{a}}. Moving south changes {{b}}.',
          [
            { id: 'a', choices: ['x', 'y', 'both'] },
            { id: 'b', choices: ['y', 'x', 'both'] }
          ],
          { a: 'x', b: 'y' },
          {
            explainMd:
              'East and west move along x: east adds 1, west subtracts 1. North and south move along y, and on this grid y grows downward, so south adds 1 and north subtracts 1. Mixing the two axes is the usual reason a walk lands one cell off.'
          }
        ),
        playCode({
          id: 'reach-beacon',
          prompt: '> Walk the fox from `(0, 0)` onto the beacon at `(3, 2)`.',
          guided: true,
          world: gridWorld([fox(0, 0), beacon(3, 2)], 5, 5),
          goal: { all: [at('fox', 'x', 3), at('fox', 'y', 2)] },
          hidden: true,
          hints: ladder(
            'The beacon is at x=3, y=2. One call changes one coordinate by one.',
            'That is three east calls and two south calls. Order does not matter.',
            'From `(0, 0)`, two east calls and one south call would land on `(2, 1)`.',
            'Player.move("east")\nPlayer.move("east")\nPlayer.move("east")\nPlayer.move("south")\nPlayer.move("south")'
          )
        })
      ]
    }),
    files: {
      'main.py': `Player.move("east")
`,
      'hidden_test.py': playLogOk()
    }
  })

  out.push({
    doc: lesson({
      id: 'for-over-range',
      courseId: 'flow',
      moduleId: 'repeat',
      title: 'Counting with range',
      skillIds: ['python.control.loops'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'A loop that counts, and where it stops',
          idea:
            '`range` produces a run of whole numbers for a `for` loop to walk. `range(n)` starts at 0 and stops **before** n, so it yields exactly n numbers. `range(start, stop)` begins wherever you say, and `range(start, stop, step)` lets you count by twos, by fives, or backwards.',
          bites:
            'This bites because the end is exclusive and almost every sentence in English is inclusive. "Sum the readings one through five" becomes `range(1, 5)` and quietly drops the five. The same off-by-one runs the other way when you write `range(n + 1)` out of caution and walk one cell past the edge of the grid.',
          code: `print(list(range(3)))          # [0, 1, 2]        — three numbers, no 3
print(list(range(1, 4)))       # [1, 2, 3]        — stops before 4
print(list(range(0, 10, 3)))   # [0, 3, 6, 9]
print(list(range(3, 0, -1)))   # [3, 2, 1]

for i in range(3):
    print(i)`,
          mistake:
            'A common mistake is remembering the rule for `range(n)` and forgetting it for `range(start, stop)`. The stop value is excluded in every form. The exercise asks for the total of every whole number from 1 up to and including n, so the stop you write is not the number you want to reach.'
        }),
        predict(
          'range-three',
          'What is `list(range(3))`?',
          [
            { id: 'inclusive', md: '`[1, 2, 3]`', misconceptionId: 'range-is-inclusive' },
            { id: 'exclusive', md: '`[0, 1, 2]`' }
          ],
          'exclusive',
          {
            explainMd:
              '`range` counts from 0 and stops before the number you gave it, so `range(3)` yields 0, 1, and 2 — three values, none of them 3. Reading it as "three times, starting at zero" is the habit that makes loop bounds stop being a guess.'
          }
        ),
        cloze(
          'range-words',
          '`range(2, 9, 3)` starts at {{a}} and its last value is {{b}}.',
          [
            { id: 'a', choices: ['2', '0', '3'] },
            { id: 'b', choices: ['8', '9', '11'] }
          ],
          { a: '2', b: '8' },
          {
            explainMd:
              'Counting by threes from 2 gives 2, 5, 8 — the next one would be 11, which is past the stop, so the run ends at 8. The stop value itself is never produced, and neither is any value beyond it, no matter what the step is.'
          }
        ),
        pyCode({
          id: 'total-steps',
          prompt:
            '> Finish `total_steps(n)` so it returns the sum of every whole number from 1 up to and **including** n. `total_steps(5)` is `15`.',
          equals: '15',
          ast: 'range(',
          misconceptionId: 'range-is-inclusive',
          hidden: true,
          hints: ladder(
            'The starter adds up 0, 1, 2, 3 and 4 and gets 10. Two things are wrong with that run of numbers.',
            'The first value should be 1, not 0, and the run has to reach n. Both are fixed by the two arguments you pass to `range`.',
            '`range(1, 4)` gives 1, 2, 3 — to include a number you name one more than it as the stop.',
            'def total_steps(n):\n    total = 0\n    for i in range(1, n + 1):\n        total = total + i\n    return total\n\n\nprint(total_steps(5))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def total_steps(n):
    total = 0
    for i in range(n):
        total = total + i
    return total


print(total_steps(5))
`,
      'hidden_test.py': importAssert(`assert main.total_steps(5) == 15
assert main.total_steps(1) == 1
assert main.total_steps(0) == 0
assert main.total_steps(10) == 55`)
    }
  })

  out.push({
    doc: lesson({
      id: 'while-and-break',
      courseId: 'flow',
      moduleId: 'repeat',
      title: 'Loop until it is done',
      skillIds: ['python.control.loops'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'A loop with no count, only a condition',
          idea:
            'A `for` loop knows how many times it will run before it starts. A `while` loop does not: it re-asks its condition before every pass and keeps going while the answer stays true. Use it when the finish line is a state — the battery is flat, the queue is empty — rather than a number of turns.',
          bites:
            'This bites when nothing inside the loop moves the condition towards false. The battery never drains, the counter never climbs, and the program spins forever. In this app that shows up as a run that times out after a few seconds rather than a frozen window, but the bug is the same one, and the fix is always to make the body change the thing the condition asks about.',
          code: `charge = 10
ticks = 0
while charge > 0:
    charge = charge - 3
    ticks = ticks + 1
print(ticks)        # 4 — the last pass took it to -2

while True:
    break           # break leaves the loop immediately`,
          mistake:
            'A common mistake is guarding against a runaway with a counter that caps the passes and then returning that counter as if it were the answer. A cap tells you the loop misbehaved; it is not a result. The exercise asks how many drains empty a battery, and it also has to survive a drain of zero, which would otherwise never finish.'
        }),
        predict(
          'drain-count',
          'With `charge = 10` and a drain of 3, how many passes does `while charge > 0` make?',
          [
            { id: 'three', md: '3 — after three passes only 1 is left' },
            { id: 'four', md: '4' }
          ],
          'four',
          {
            explainMd:
              'The condition is re-asked before each pass, not after. After three passes the charge is 1, which is still above zero, so a fourth pass runs and takes it to -2. Only then does the condition fail. Counting the pass that overshoots is the normal shape of a drain loop.'
          }
        ),
        tf(
          'break-exits',
          '`break` skips the rest of the current pass and leaves the loop entirely.',
          true,
          {
            explainMd:
              'True. `break` abandons the loop on the spot, so no further passes happen and no remaining lines of the body run. That is what makes it the right tool for an impossible situation discovered mid-loop, and it is different from `continue`, which only abandons the current pass and then carries on.'
          }
        ),
        pyCode({
          id: 'ticks-to-empty',
          prompt:
            '> Finish `ticks_to_empty(charge, drain)` so it counts how many drains take the charge to zero or below. If `drain` is zero or negative the loop can never finish, so `break` out and return `-1`. The printed line should be `4`.',
          equals: '4',
          ast: 'while',
          hidden: true,
          hints: ladder(
            'The starter counts passes but never changes `charge`, so only the emergency cap stops it. The condition has to move.',
            'Subtract `drain` from `charge` inside the body. Then handle the impossible case: when the drain cannot reduce the charge, `break` and report `-1`.',
            '`while fuel > 0: fuel = fuel - burn` finishes on its own because every pass makes the condition closer to false.',
            'def ticks_to_empty(charge, drain):\n    ticks = 0\n    while charge > 0:\n        if drain <= 0:\n            ticks = -1\n            break\n        charge = charge - drain\n        ticks = ticks + 1\n    return ticks\n\n\nprint(ticks_to_empty(10, 3))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def ticks_to_empty(charge, drain):
    ticks = 0
    while charge > 0:
        ticks = ticks + 1
        if ticks > 100:
            break
    return ticks


print(ticks_to_empty(10, 3))
`,
      'hidden_test.py': importAssert(`assert main.ticks_to_empty(10, 3) == 4
assert main.ticks_to_empty(9, 3) == 3
assert main.ticks_to_empty(7, 7) == 1
assert main.ticks_to_empty(0, 3) == 0
assert main.ticks_to_empty(10, 0) == -1
assert main.ticks_to_empty(10, -2) == -1`)
    }
  })

  out.push({
    doc: lesson({
      id: 'loop-else-and-continue',
      courseId: 'flow',
      moduleId: 'repeat',
      title: 'Skip a pass, or finish without finding',
      skillIds: ['python.control.loops'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Two words that shape a search',
          idea:
            '`continue` abandons the current pass and jumps straight to the next one, which keeps a filter from burying the real work in another level of indentation. Python also lets a loop carry an `else`, and that `else` runs when the loop finished normally — that is, when no `break` fired.',
          bites:
            'This bites because `for ... else` reads like "otherwise" and means "no break". Attached to a search loop it is genuinely useful: the `else` is the not-found case, and you no longer need a `found = False` flag that someone will forget to reset. Read it as `for ... then-if-nothing-broke` and it stops being strange.',
          code: `for n in range(1, 6):
    if n % 2 == 0:
        continue          # skip the evens, keep looping
    print(n)              # 1 3 5

for n in range(3):
    if n == 99:
        break
else:
    print("no break fired")`,
          mistake:
            'A common mistake is letting a search loop run to the end after it has already found its answer, so a later value quietly overwrites the first match. Once you have what you came for, `break` — and put the not-found answer in the `else`. The exercise asks for the *first* odd multiple of seven, so stopping at the right moment is the whole task.'
        }),
        predict(
          'else-after-break',
          'A `for` loop hits `break` on its second pass. Does its `else` block run?',
          [
            { id: 'yes', md: 'Yes — `else` runs after every loop' },
            { id: 'no', md: 'No — `else` only runs when no `break` fired' }
          ],
          'no',
          {
            explainMd:
              'A loop `else` is really a "completed without breaking" clause. Because the loop was cut short by `break`, the `else` is skipped. That is exactly what makes the pattern useful for searches: the `else` is the branch that means "I looked at everything and found nothing".'
          }
        ),
        tf(
          'continue-exits',
          '`continue` ends the loop the same way `break` does.',
          false,
          {
            explainMd:
              'It does not. `continue` only abandons the rest of the current pass; the loop then asks for the next value and carries on. `break` leaves the loop for good. Confusing the two turns a filter into an early exit, so a scan that was meant to skip blank lines stops at the first one instead.'
          }
        ),
        pyCode({
          id: 'first-odd-multiple',
          prompt:
            '> Finish `first_odd_multiple(limit)` so it returns the first **odd** multiple of 7 below `limit`, skipping even numbers with `continue`, and returns `0` from the loop `else` when there is none. `first_odd_multiple(30)` is `7`.',
          equals: '7',
          ast: 'continue',
          hidden: true,
          hints: ladder(
            'The starter looks at every number and keeps overwriting its answer, so it reports the last match instead of the first.',
            'Skip the evens with `continue`, and `break` out the moment you find a match. Put the `0` in an `else` attached to the `for`.',
            '`for c in text:` with `if c == " ": continue` skips the spaces; a later `break` plus `else` handles "searched everything, found nothing".',
            'def first_odd_multiple(limit):\n    for n in range(1, limit):\n        if n % 2 == 0:\n            continue\n        if n % 7 == 0:\n            found = n\n            break\n    else:\n        found = 0\n    return found\n\n\nprint(first_odd_multiple(30))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def first_odd_multiple(limit):
    found = 0
    for n in range(1, limit):
        if n % 2 == 0:
            found = 0
        if n % 7 == 0:
            found = n
    return found


print(first_odd_multiple(30))
`,
      'hidden_test.py': importAssert(`assert main.first_odd_multiple(30) == 7
assert main.first_odd_multiple(8) == 7
assert main.first_odd_multiple(7) == 0
assert main.first_odd_multiple(5) == 0
assert main.first_odd_multiple(2) == 0
assert main.first_odd_multiple(22) == 7`)
    }
  })

  out.push({
    doc: lesson({
      id: 'nested-loops-grid',
      courseId: 'flow',
      moduleId: 'repeat',
      title: 'A loop inside a loop',
      skillIds: ['python.control.loops', 'python.call.move'],
      estimatedMinutes: 20,
      blocks: [
        teach({
          heading: 'Rows on the outside, cells on the inside',
          idea:
            'Put one loop inside another and the inner one runs to completion on every single pass of the outer one. Three outer passes over a four-step inner loop is twelve steps, not seven. That is the natural shape of anything rectangular: the outer loop picks the row, the inner loop walks it.',
          bites:
            'This bites when the two loops share a counter name, or when a line that belongs to the outer loop is indented one level too far and ends up running once per cell. Indentation is the only thing that says which loop a statement belongs to, so a stray four spaces turns "step south once per row" into "step south after every cell".',
          code: `for row in range(3):
    for step in range(4):
        print(row, step, end=" ")
    print()          # once per row, because it sits in the outer body

# 0 0 0 1 0 2 0 3
# 1 0 1 1 1 2 1 3
# 2 0 2 1 2 2 2 3`,
          mistake:
            'A common mistake is stepping to the next row on the last pass too, which walks the fox into the wall below the field. On a grid the move is simply refused and the fox stays put, so the run looks fine and the count is wrong. The exercise sweeps three rows of a five-wide field and collects a coin at the east end of each.'
        }),
        predict(
          'how-many-steps',
          'How many times does `Player.move` run in a `for row in range(3)` loop whose body is a `for step in range(4)` loop with one move in it?',
          [
            { id: 'seven', md: '7 — three plus four' },
            { id: 'twelve', md: '12' }
          ],
          'twelve',
          {
            explainMd:
              'The inner loop restarts and runs all four of its passes on every pass of the outer loop, so the moves multiply rather than add: three rows times four steps is twelve. Nested loops are how a one-dimensional instruction covers a two-dimensional area, and the total is always the product.'
          }
        ),
        cloze(
          'nesting-words',
          'The {{a}} loop chooses the row. A line that should run once per row belongs in the {{b}} loop body.',
          [
            { id: 'a', choices: ['outer', 'inner', 'either'] },
            { id: 'b', choices: ['outer', 'inner', 'neither'] }
          ],
          { a: 'outer', b: 'outer' },
          {
            explainMd:
              'The outer loop advances once per row, so anything that happens per row — stepping south, printing a newline, resetting a running total — sits directly in its body at the shallower indentation. Push that line one level deeper and it becomes a per-cell action, which is the single most common nested-loop bug.'
          }
        ),
        playCode({
          id: 'sweep-the-rows',
          prompt:
            '> Sweep all three rows of the field with a loop inside a loop: run east across the row, run back west, then step south — but not after the last row. Pick up all three coins and finish at `(0, 2)`.',
          world: gridWorld(
            [fox(0, 0), token('coin-a', 'coin', 4, 0), token('coin-b', 'coin', 4, 1), token('coin-c', 'coin', 4, 2)],
            5,
            3
          ),
          goal: {
            all: [
              at('fox', 'x', 0),
              at('fox', 'y', 2),
              at('coin-a', 'taken', true),
              at('coin-b', 'taken', true),
              at('coin-c', 'taken', true)
            ]
          },
          hidden: true,
          hints: ladder(
            'The starter runs one row and stops. Three rows means an outer loop wrapped around the run you already have.',
            'The field is five wide, so each run is four moves. Inside the outer loop: four east, four west, then one south — and guard that last south so the third row does not try to step off the field.',
            'A sweep of two rows would be `for row in range(2):` around `for step in range(3): Player.move("east")` and its matching westward loop.',
            'for row in range(3):\n    for step in range(4):\n        Player.move("east")\n    for step in range(4):\n        Player.move("west")\n    if row < 2:\n        Player.move("south")'
          )
        })
      ]
    }),
    files: {
      'main.py': `for step in range(4):
    Player.move("east")
`,
      'hidden_test.py': playLogOk(`src = Path("main.py").read_text(encoding="utf-8")
assert src.count("for ") >= 2, "use one loop inside another"
assert len(log) >= 20, "sweep every row instead of cutting the corner"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'debug-off-by-one',
      courseId: 'flow',
      moduleId: 'repeat',
      title: 'Debug: one step too far',
      skillIds: ['python.control.loops'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'The last valid index is one less than the length',
          idea:
            'A sequence of n items has indexes `0` through `n - 1`. `len` reports n, so the last index is always `len(thing) - 1`, and `range(len(thing))` produces exactly the valid indexes and nothing else. Reaching for index n is reaching past the end.',
          bites:
            'This bites the moment a `+ 1` is added to a loop bound "to be safe". The loop walks one position past the data and Python raises `IndexError: string index out of range`. Read the traceback backwards: the last frame names the line, and the line names the index expression that went too far.',
          code: `digits = "abc"
print(len(digits))                # 3
print(digits[0], digits[2])       # a c
print(list(range(len(digits))))   # [0, 1, 2] — every valid index, once
# digits[3] raises IndexError: string index out of range`,
          mistake:
            'A common mistake is patching the symptom by wrapping the body in a `try` instead of fixing the bound. The loop is asking a question about a position that does not exist, and no amount of catching makes that position appear. The code below already crashes — your job is to repair the range so it walks every digit exactly once.'
        }),
        predict(
          'crash-line',
          'The station readings are `"37152"`. Which index does `range(len(digits) + 1)` reach that `"37152"` does not have?',
          [
            { id: 'four', md: '`4` — the last digit' },
            { id: 'five', md: '`5`' }
          ],
          'five',
          {
            explainMd:
              'The string has five characters, so `len` is 5 and the valid indexes are 0 through 4. Adding one to the bound makes the loop also try index 5, which is one past the end, and that is the position that raises `IndexError`. Removing the `+ 1` makes the run exactly as long as the data.'
          }
        ),
        tf(
          'len-is-last',
          '`len(text)` is a valid index into `text`.',
          false,
          {
            explainMd:
              'It is not, unless the string is empty — and then nothing is valid. Indexing starts at 0, so a string of length 5 stops at index 4 and `text[5]` raises `IndexError`. Holding on to "last index is len minus one" removes most off-by-one bugs before you ever write them.'
          }
        ),
        pyCode({
          id: 'repair-the-scan',
          debug: true,
          prompt:
            '> This scan of the station readings crashes with an `IndexError`. Repair the loop bound so it walks every digit exactly once, and the highest digit `7` is printed.',
          equals: '7',
          ast: 'range(len(',
          hidden: true,
          hints: ladder(
            'Run it and read the last frame of the traceback. It names the line and the index that did not exist.',
            'The valid indexes of a five-character string are 0 to 4. `range(len(digits))` already produces exactly those — the `+ 1` asks for one more.',
            'For `"abc"`, `range(len("abc"))` gives 0, 1, 2. That is three passes for three characters, which is what a full scan needs.',
            'READINGS = "37152"\n\n\ndef highest(digits):\n    best = 0\n    for i in range(len(digits)):\n        value = int(digits[i])\n        if value > best:\n            best = value\n    return best\n\n\nprint(highest(READINGS))'
          )
        })
      ]
    }),
    files: {
      'main.py': `READINGS = "37152"


def highest(digits):
    best = 0
    for i in range(len(digits) + 1):
        value = int(digits[i])
        if value > best:
            best = value
    return best


print(highest(READINGS))
`,
      'hidden_test.py': importAssert(`assert main.highest("37152") == 7
assert main.highest("9") == 9
assert main.highest("1234") == 4
assert main.highest("") == 0`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-patrol-route',
      courseId: 'flow',
      moduleId: 'repeat',
      title: 'Transfer: the evening patrol',
      skillIds: ['python.control.loops', 'python.control.if', 'python.call.move'],
      estimatedMinutes: 22,
      mastery: { requiresTransfer: true },
      blocks: [
        teach({
          heading: 'A route the loops have to bend around',
          idea:
            'Every evening the fox walks the same patrol: out along the field, up to the north flag, and down the east edge to the south flag. The route is repetitive, so loops write it far more reliably than twenty hand-typed calls — and when the field changes, only the counts change.',
          bites:
            'This bites when something solid sits on the straight line. A move into a rock is refused rather than reported: the fox simply stays where it is, the run finishes without complaint, and every later move in the plan is now offset by one cell. Nothing goes wrong loudly; the patrol just ends in the wrong place.',
          code: `for step in range(2):
    Player.move("east")     # two cells, then decide

Player.move("south")        # drop a row to get past whatever is ahead

for step in range(4):
    Player.move("east")     # the long run, on the clear row`,
          mistake:
            'A common mistake is writing one long eastward loop and trusting the field to be empty. Count the cells between the fox and each obstacle before you choose a loop bound, and split the run into the part before the detour and the part after it. The exercise asks for both flags and a finish at the south-east corner.'
        }),
        predict(
          'blocked-move',
          'The fox is at `(2, 0)` and a rock sits at `(3, 0)`. What does `Player.move("east")` do?',
          [
            { id: 'fault', md: 'Stops the run with an error' },
            { id: 'stay', md: 'Nothing — the fox stays at `(2, 0)`' }
          ],
          'stay',
          {
            explainMd:
              'A blocked move is quietly refused: the world rejects it and the fox keeps its old position, so the run carries on as if the step had happened. That silence is why an obstacle turns into a mysterious end position rather than a crash, and why you plan the route around it instead of hoping.'
          }
        ),
        check(
          'why-loops-here',
          'Why write the patrol with loops rather than twenty `Player.move` lines?',
          [
            { id: 'faster', md: 'The loop version runs faster on the grid' },
            { id: 'edit', md: 'One bound changes when the field changes, instead of a dozen lines' },
            { id: 'required', md: 'The grid only accepts moves issued from a loop' }
          ],
          'edit',
          {
            explainMd:
              'Speed is not the point — the same moves are issued either way. The point is that the route is described by a few numbers, so widening the field means editing a bound rather than counting typed lines and hoping you added the right number. A miscount in twenty near-identical lines is nearly invisible during review.'
          }
        ),
        playCode({
          id: 'patrol-the-field',
          prompt:
            '> Walk the patrol with loops. A rock blocks row 0 at `(3, 0)`, so go two east, drop south, run east along row 1, step north onto the flag at `(6, 0)`, then head down the east edge to the flag at `(6, 4)`.',
          world: field([
            fox(0, 0),
            rock('boulder', 3, 0),
            token('flag-north', 'flag', 6, 0),
            token('flag-south', 'flag', 6, 4),
            tree('pine', 1, 3),
            tree('scrub', 4, 3)
          ]),
          goal: {
            all: [at('flag-north', 'taken', true), at('flag-south', 'taken', true), at('fox', 'x', 6), at('fox', 'y', 4)]
          },
          hidden: true,
          hints: ladder(
            'The starter runs east six times and finishes at `(2, 0)`. Four of those moves were refused by the rock and you were never told.',
            'Break the route into runs: two east, one south, four east, one north to the flag, then four south down the edge. Each run of the same direction is a `for` loop.',
            'A short detour looks like `for step in range(2): Player.move("east")` then a single `Player.move("south")` before the next loop begins.',
            'for step in range(2):\n    Player.move("east")\n\nPlayer.move("south")\n\nfor step in range(4):\n    Player.move("east")\n\nPlayer.move("north")\n\nfor step in range(4):\n    Player.move("south")'
          )
        }),
        reflect(
          'patrol-notes',
          'In your own words: how would you have spotted the blocked move if the fox had ended one cell short and nothing had been printed?'
        )
      ]
    }),
    files: {
      'main.py': `for step in range(6):
    Player.move("east")
`,
      'hidden_test.py': playLogOk(`src = Path("main.py").read_text(encoding="utf-8")
assert src.count("for ") >= 2, "write the runs as loops, not as typed-out moves"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'def-and-return',
      courseId: 'functions',
      moduleId: 'define',
      title: 'Return is not print',
      skillIds: ['python.functions', 'python.io.stdio'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Showing a value and handing it back are different jobs',
          idea:
            '`print` writes characters to the screen for a human to read, and then the value is gone. `return` hands a value back to whoever called the function, so the rest of the program can store it, compare it, or pass it on. A function with no `return` still returns something: `None`.',
          bites:
            'This bites the first time you try to reuse a function that only printed. `print(summary(...))` shows the line and then a second line reading `None`, because the call itself produced nothing. It bites again when a test asks the function for its answer: the text went to the screen, the test got `None`, and the failure message mentions a value you can plainly see on your terminal.',
          code: `def show(text):
    print(text.upper())          # writes to the screen, hands back nothing


def make(text):
    return text.upper()          # hands the value back


result = show("fox")
print(result)                    # FOX, then None
print(make("fox") + "!")         # FOX! — a value you can keep using`,
          mistake:
            'A common mistake is treating the printed output as the result of the program. The screen is a side effect; the return value is the product. The exercise asks for a one-line station summary, and the `print` around the call is already written for you, so your function must hand the text back rather than print it itself.'
        }),
        predict(
          'print-then-none',
          'A function that only calls `print` and has no `return` — what does the call itself evaluate to?',
          [
            { id: 'text', md: 'The text that was printed', misconceptionId: 'print-is-the-program' },
            { id: 'none', md: '`None`' }
          ],
          'none',
          {
            explainMd:
              'Falling off the end of a function is the same as `return None`, so the call evaluates to `None` no matter what appeared on screen. That is why `print(shout("fox"))` shows the shouted word and then a lonely `None`: the first line came from inside, the second is the value the call handed back.'
          }
        ),
        tf(
          'return-ends-it',
          '`return` ends the function immediately, skipping any lines after it.',
          true,
          {
            explainMd:
              'True. As soon as a `return` runs, the function is finished and control goes back to the caller, so nothing below it in that branch executes. This is what makes early returns a clean way to handle special cases first and leave the main path unindented at the bottom of the function.'
          }
        ),
        pyCode({
          id: 'summary-line',
          prompt:
            '> Finish `summary(name, count)` so it **returns** the line `fox-den: 3`. The `print` around the call is already written, so do not print inside the function.',
          equals: 'fox-den: 3',
          ast: 'return',
          misconceptionId: 'print-is-the-program',
          hidden: true,
          hints: ladder(
            'Run the starter. Two lines appear, and the second one is `None` — that is the value the call handed back.',
            'Build the text and hand it back with `return` instead of printing it. The caller already has a `print` waiting for it.',
            '`def tag(name): return f"[{name}]"` can then be used as `print(tag("owl"))` or `header = tag("owl")`.',
            'def summary(name, count):\n    return f"{name}: {count}"\n\n\nprint(summary("fox-den", 3))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def summary(name, count):
    print(name + ": " + str(count))


print(summary("fox-den", 3))
`,
      'hidden_test.py': importAssert(`assert main.summary("fox-den", 3) == "fox-den: 3"
assert main.summary("owl", 0) == "owl: 0"
assert main.summary("north gate", 12) == "north gate: 12"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'parameters-defaults',
      courseId: 'functions',
      moduleId: 'define',
      title: 'Parameters, and the ones you can leave out',
      skillIds: ['python.functions'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'A parameter with a value already attached',
          idea:
            'Parameters are the names a function gives to the values it is handed, and they are filled in order unless you say otherwise. Give a parameter a default in the `def` line and the caller may simply omit it, which lets one function serve both the common case and the unusual one.',
          bites:
            'This bites when every call site has to spell out a value that is almost always the same. Nine calls pass `"C"` and the tenth passes `"F"`, so the important difference is buried in noise. It bites the other way too: a parameter with no default is compulsory, and leaving it out raises `TypeError: missing 1 required positional argument` before the body runs.',
          code: `def label(name, unit="C"):
    return f"{name} [{unit}]"


print(label("temp"))          # temp [C]  — the default filled in
print(label("temp", "F"))     # temp [F]  — overridden by position

# label()                     # TypeError: name has no default`,
          mistake:
            'A common mistake is putting the defaulted parameter before the required one, which Python rejects outright: every parameter after the first default must have one too. The exercise asks for a reading label where the unit is usually Celsius, so put the default where it belongs and let the common call get shorter.'
        }),
        predict(
          'missing-argument',
          'For `def reading(name, value, unit):`, what does `reading("temp", 21)` do?',
          [
            { id: 'blank', md: 'Runs with `unit` set to an empty string' },
            { id: 'typeerror', md: 'Raises `TypeError` before the body runs' }
          ],
          'typeerror',
          {
            explainMd:
              'A parameter without a default is required, and Python checks the call before executing a single line of the body. The message names the missing parameter, which makes it one of the friendlier errors in the language. Giving `unit` a default is what turns that error into a sensible fallback.'
          }
        ),
        cloze(
          'default-rules',
          'A parameter with a default may be {{a}} by the caller, and in the `def` line it must come {{b}} the required parameters.',
          [
            { id: 'a', choices: ['omitted', 'renamed', 'repeated'] },
            { id: 'b', choices: ['after', 'before', 'instead of'] }
          ],
          { a: 'omitted', b: 'after' },
          {
            explainMd:
              'Defaults exist so the caller can leave a value out and still get sensible behaviour. They have to sit after the required parameters because Python matches positional arguments left to right — if an optional one came first there would be no way to tell which value the caller meant.'
          }
        ),
        pyCode({
          id: 'reading-label',
          prompt:
            '> Give `unit` a default of `"C"` so `reading("temp", 21)` works on its own and returns `temp 21C`, while `reading("wind", 4, "kn")` still overrides it.',
          equals: 'temp 21C',
          ast: 'unit=',
          hidden: true,
          hints: ladder(
            'The starter prints the right line, but only because the call spells out the unit. Try calling it with two arguments.',
            'Add `= "C"` to the `unit` parameter in the `def` line, then drop the third argument from the call below.',
            '`def pause(seconds=1): ...` can be called as `pause()` or `pause(5)`, and the default only applies when the argument is absent.',
            'def reading(name, value, unit="C"):\n    return f"{name} {value}{unit}"\n\n\nprint(reading("temp", 21))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def reading(name, value, unit):
    return f"{name} {value}{unit}"


print(reading("temp", 21, "C"))
`,
      'hidden_test.py': importAssert(`assert main.reading("temp", 21) == "temp 21C"
assert main.reading("depth", 0) == "depth 0C"
assert main.reading("wind", 4, "kn") == "wind 4kn"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'keyword-args',
      courseId: 'functions',
      moduleId: 'define',
      title: 'Call it by name',
      skillIds: ['python.functions'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Arguments that say what they are',
          idea:
            'Any parameter can be filled by name at the call site: `line("fox seen", stamp="1215")`. Keyword arguments may appear in any order, they may skip over defaults you are happy with, and they turn the call itself into documentation of what each value means.',
          bites:
            'This bites hardest with a run of same-typed arguments. `report(tag, True, False, True)` is unreadable at a glance and silently wrong if two of the flags swap, because nothing about the types complains. The same call written as `report(tag, trimmed=True, dated=True)` says what it wants and is immune to reordering.',
          code: `def report(name, trimmed=False, upper=False, dated=False):
    text = name.strip() if trimmed else name
    if upper:
        text = text.upper()
    return text + " @0900" if dated else text


print(report(" fox ", True, False, True))          # who remembers the order?
print(report(" fox ", trimmed=True, dated=True))   # obvious, and skips upper`,
          mistake:
            'A common mistake is handing a value positionally and landing it in the wrong parameter — the call still runs, it just means something else. The exercise has a log line with a level and a timestamp, both defaulted, and you need to override only the second one. There is exactly one way to do that.'
        }),
        predict(
          'wrong-slot',
          'For `def line(text, level="info", stamp="0900")`, what does `line("fox seen", "1215")` return?',
          [
            { id: 'stamped', md: '`1215 info fox seen`' },
            { id: 'level', md: '`0900 1215 fox seen`' }
          ],
          'level',
          {
            explainMd:
              'Positional arguments are matched left to right, so the second value lands in `level`, not in `stamp`. The call runs happily and the timestamp ends up where the severity belongs. Nothing but a keyword can skip over a parameter you want to leave at its default.'
          }
        ),
        tf(
          'keyword-order',
          'Keyword arguments can be given in any order at the call site.',
          true,
          {
            explainMd:
              'True — once an argument is named, its position stops mattering, so `line("x", stamp="1215", level="warn")` and the reverse do the same thing. The one rule is that all positional arguments have to come before the first keyword one, because Python still matches those by position.'
          }
        ),
        pyCode({
          id: 'named-call',
          prompt:
            '> Leave the function as it is and fix the **call** so the timestamp lands in `stamp` and the level keeps its default. The printed line should be `1215 info fox seen`.',
          equals: '1215 info fox seen',
          ast: 'stamp=',
          hidden: true,
          hints: ladder(
            'The function is already right. Look at what the printed line puts where, and compare it with the order of the parameters.',
            'The second positional slot is `level`. To reach `stamp` while leaving `level` alone, name it in the call.',
            '`pour(cup, amount=200)` fills only `amount`, no matter how many defaulted parameters sit between it and `cup`.',
            'def line(text, level="info", stamp="0900"):\n    return f"{stamp} {level} {text}"\n\n\nprint(line("fox seen", stamp="1215"))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def line(text, level="info", stamp="0900"):
    return f"{stamp} {level} {text}"


print(line("fox seen", "1215"))
`,
      'hidden_test.py': importAssert(`assert main.line("fox seen", stamp="1215") == "1215 info fox seen"
assert main.line("gate open") == "0900 info gate open"
assert main.line("power low", level="warn") == "0900 warn power low"
assert main.line("storm", level="warn", stamp="2130") == "2130 warn storm"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'mutable-default-trap',
      courseId: 'functions',
      moduleId: 'define',
      title: 'The default that remembers',
      skillIds: ['python.functions'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'A default value is built once, not once per call',
          idea:
            'The expression after `=` in a parameter list is evaluated when the `def` statement runs — once, as the file loads — and the resulting object is stored on the function. Every later call that omits that argument is handed the very same object, not a fresh copy of it.',
          bites:
            'This bites only with values that can be changed in place: a list, a dict, a set. A default of `0` or `"C"` is harmless because nothing can mutate it. A default of `[]` is a shared bag: the first call drops something in, the second call finds it still there, and the function appears to remember calls it should know nothing about.',
          code: `def collect(item, bag=[]):
    bag.append(item)
    return bag


print(collect("moss"))          # ['moss']
print(collect("bark"))          # ['moss', 'bark'] — same list came back
print(collect.__defaults__)     # (['moss', 'bark'],) — stored on the function`,
          mistake:
            'A common mistake is "fixing" this by clearing the bag at the top of the function, which then destroys a list the caller passed in deliberately. The safe default is `None`, with the real empty list built inside the body. The exercise asks for a `collect` that starts empty every time and still accepts a bag you hand it.'
        }),
        predict(
          'twice-called',
          'With `def collect(item, bag=[])`, calling `collect("moss")` and then `collect("bark")` gives…',
          [
            { id: 'fresh', md: '`["moss"]` then `["bark"]`', misconceptionId: 'mutable-default-is-fresh' },
            { id: 'shared', md: '`["moss"]` then `["moss", "bark"]`' }
          ],
          'shared',
          {
            explainMd:
              'One list was created when the `def` ran, and both calls appended to it, so the second call sees the first call\u2019s item. The list is stored on the function object itself and survives for the lifetime of the program, which is why this bug often shows up as data leaking between unrelated requests.'
          }
        ),
        tf(
          'string-default-safe',
          'A default of `unit="C"` has the same sharing problem as a default of `bag=[]`.',
          false,
          {
            explainMd:
              'It does not. The string is shared in exactly the same way, but strings are immutable, so no call can change it — the worst any call can do is rebind its own local name to a different string. Sharing is only dangerous when the shared object can be modified in place.'
          }
        ),
        pyCode({
          id: 'fresh-bag',
          prompt:
            '> Fix `collect(item, bag=...)` so each call with no bag starts empty, while a bag you pass in is still appended to. The printed line should be `[\'moss\'] [\'bark\']`.',
          equals: "['moss'] ['bark']",
          ast: 'None',
          misconceptionId: 'mutable-default-is-fresh',
          hidden: true,
          hints: ladder(
            'Run the starter. Both halves of the printed line are identical, because both calls returned the same list object.',
            'Default the parameter to `None` — an immutable sentinel that nothing can mutate — and build the empty list inside the body when it is still `None`.',
            '`def note(text, lines=None):` followed by `if lines is None: lines = []` gives every defaulted call its own fresh list.',
            'def collect(item, bag=None):\n    if bag is None:\n        bag = []\n    bag.append(item)\n    return bag\n\n\nprint(collect("moss"), collect("bark"))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def collect(item, bag=[]):
    bag.append(item)
    return bag


print(collect("moss"), collect("bark"))
`,
      'hidden_test.py': importAssert(`assert main.collect("moss") == ["moss"]
assert main.collect("bark") == ["bark"]
assert main.collect("fern", ["moss"]) == ["moss", "fern"]
first = main.collect("a")
second = main.collect("b")
assert first is not second, "each defaulted call needs its own list"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'args-and-kwargs',
      courseId: 'functions',
      moduleId: 'define',
      title: 'However many arguments arrive',
      skillIds: ['python.functions'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'A star collects, and a star spreads',
          idea:
            'In a `def` line, `*values` collects every extra positional argument into a tuple and `**options` collects every extra keyword argument into a dict. At a call site the same stars work in reverse: `total(*readings)` spreads a sequence out into separate arguments, and `total(**settings)` spreads a dict out into keywords.',
          bites:
            'This bites when a function takes one sequence and you wanted it to take several numbers, or the other way round. `total([1, 2, 3])` and `total(1, 2, 3)` are different calls, and only one of them matches a given `def`. Anything written after `*values` becomes keyword-only, which is usually what you want for a flag nobody should pass by position.',
          code: `def tally(*counts, **labels):
    return sum(counts), sorted(labels)


print(tally(1, 2, 3))              # (6, [])
print(tally(1, 2, fox="den"))      # (3, ['fox'])

numbers = (4, 5)
print(tally(*numbers))             # (9, []) — spread back out`,
          mistake:
            'A common mistake is passing the tuple itself into a starred parameter, so `values` ends up as a tuple holding one tuple and `sum` fails. The star belongs on the call as well as on the definition. The exercise takes any number of readings plus an optional scale, and the readings already live in a tuple.'
        }),
        predict(
          'star-at-call',
          'With `def total(*values)` and `READINGS = (3, 4, 5)`, which call gives `12`?',
          [
            { id: 'plain', md: '`total(READINGS)`' },
            { id: 'starred', md: '`total(*READINGS)`' }
          ],
          'starred',
          {
            explainMd:
              '`total(READINGS)` passes one argument — the tuple — so `values` becomes `((3, 4, 5),)` and summing it fails. The star at the call site unpacks the tuple into three separate arguments, which is exactly what a starred parameter is waiting to collect.'
          }
        ),
        cloze(
          'star-words',
          'In a `def`, `*values` collects extra positional arguments into a {{a}}, and `**options` collects keyword arguments into a {{b}}.',
          [
            { id: 'a', choices: ['tuple', 'list', 'string'] },
            { id: 'b', choices: ['dict', 'set', 'tuple'] }
          ],
          { a: 'tuple', b: 'dict' },
          {
            explainMd:
              'Positional arguments have an order but no names, so they arrive as a tuple. Keyword arguments are name-and-value pairs, so they arrive as a dict keyed by the names the caller used. Knowing the two shapes is what lets you forward them on to another function unchanged.'
          }
        ),
        pyCode({
          id: 'total-readings',
          prompt:
            '> Change `total` so it collects any number of readings, and keep `scale` as a keyword-only option after the star. Then spread `READINGS` at the call site. The printed line should be `12`.',
          equals: '12',
          ast: '*values',
          hidden: true,
          hints: ladder(
            'The starter only accepts one sequence, so `total(3, 4, 5)` is a `TypeError`. The function should collect however many numbers arrive.',
            'Put a star in front of the parameter in the `def` line, and put a star in front of the tuple at the call site to spread it back out.',
            '`def longest(*words): return max(words, key=len)` is then called as `longest("fox", "owl")` or `longest(*tags)`.',
            'READINGS = (3, 4, 5)\n\n\ndef total(*values, scale=1):\n    return sum(values) * scale\n\n\nprint(total(*READINGS))'
          )
        })
      ]
    }),
    files: {
      'main.py': `READINGS = (3, 4, 5)


def total(values, scale=1):
    return sum(values) * scale


print(total(READINGS))
`,
      'hidden_test.py': importAssert(`assert main.total(3, 4, 5) == 12
assert main.total() == 0
assert main.total(*[1, 2]) == 3
assert main.total(1, 2, scale=3) == 9`)
    }
  })

  out.push({
    doc: lesson({
      id: 'scope-and-global',
      courseId: 'functions',
      moduleId: 'scope',
      title: 'Where a name lives',
      skillIds: ['python.functions.scope'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Assignment decides which scope a name belongs to',
          idea:
            'Each call gets its own little namespace. Python decides at compile time whether a name inside a function is local or not, and the rule is blunt: if the function assigns to that name anywhere in its body, the name is local for the whole function. Reading a module-level name is fine; assigning to one makes a separate local instead.',
          bites:
            'This bites in two shapes. Assign after reading and you get `UnboundLocalError`, because the read now refers to a local that has no value yet. Assign without reading and you get silence: the function sets its own private copy, the module-level name never moves, and the count you were tracking stays at zero forever.',
          code: `count = 0


def seen():
    count = 1        # a brand new local name, unrelated to the one above
    return count


print(seen())        # 1
print(count)         # 0 — the module name never moved`,
          mistake:
            'A common mistake is reaching for `global` to make the assignment stick. It works, and it also makes the function impossible to test or reuse, because its behaviour now depends on hidden state. Take the value as a parameter and hand the new one back instead — the exercise is built so that rebinding at the call site is the whole fix.'
        }),
        predict(
          'local-shadow',
          'In the code above, what does `print(count)` show after `seen()` has run?',
          [
            { id: 'one', md: '`1` — the function updated it' },
            { id: 'zero', md: '`0`' }
          ],
          'zero',
          {
            explainMd:
              'The assignment inside `seen` created a local name that vanished when the call ended, so the module-level `count` was never touched. Nothing warns you about this, which is what makes it a quiet bug: the function returns the number you expected while the state you were tracking stays put.'
          }
        ),
        tf(
          'read-is-fine',
          'A function can read a module-level name without declaring anything.',
          true,
          {
            explainMd:
              'True. Name lookup walks local, then enclosing, then module, then builtins, so a function body can read a constant defined above it with no ceremony. It is only assignment that forces the decision, because assigning is what claims the name for the local scope.'
          }
        ),
        pyCode({
          id: 'count-without-global',
          prompt:
            '> Make `record(count)` **return** the incremented value instead of trying to change anything outside itself, then rebind `seen` at each call site. The printed line should be `2`.',
          equals: '2',
          ast: 'return',
          hidden: true,
          hints: ladder(
            'The starter calls `record` twice and still prints `0`. The parameter was rebound inside the function and then thrown away.',
            'Rebinding a parameter never reaches the caller. Return the new value and assign it back where you call from.',
            '`level = raise_by(level, 2)` is the pattern: the function is pure, and the caller decides what to do with the answer.',
            'seen = 0\n\n\ndef record(count):\n    return count + 1\n\n\nseen = record(seen)\nseen = record(seen)\nprint(seen)'
          )
        })
      ]
    }),
    files: {
      'main.py': `seen = 0


def record(count):
    count = count + 1


record(seen)
record(seen)
print(seen)
`,
      'hidden_test.py': importAssert(`assert main.record(0) == 1
assert main.record(4) == 5
assert main.seen == 2, "rebind seen at each call site"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'closures-and-nonlocal',
      courseId: 'functions',
      moduleId: 'scope',
      title: 'A function that remembers',
      skillIds: ['python.functions.scope'],
      estimatedMinutes: 19,
      blocks: [
        teach({
          heading: 'The inner function keeps the outer one alive',
          idea:
            'Define a function inside another function and the inner one keeps a live link to the names around it. That link survives after the outer call has returned, so the little function carries a private piece of state that nothing else can reach. This is a closure, and it is how you hand someone a counter without handing them a global.',
          bites:
            'This bites the moment the inner function tries to **assign** to one of those outer names. The same rule as before applies — assignment makes the name local — so the inner function creates its own copy and the running total resets on every call, or raises `UnboundLocalError` if it also reads it first. `nonlocal` is the declaration that says "this name belongs to the enclosing function, not to me".',
          code: `def counter():
    total = 0

    def bump():
        nonlocal total
        total = total + 1
        return total

    return bump


tick = counter()
print(tick(), tick(), tick())    # 1 2 3
print(counter()())               # 1 — a separate counter, its own total`,
          mistake:
            'A common mistake is confusing `nonlocal` with `global`. `global` jumps all the way out to module level; `nonlocal` stops at the nearest enclosing function that already has the name. The exercise builds a running tally, and each tally you create must count independently of the others.'
        }),
        predict(
          'two-counters',
          'With the `counter` above, `a = counter()` and `b = counter()`. After `a()` twice, what does `b()` return?',
          [
            { id: 'three', md: '`3` — they share the total' },
            { id: 'one', md: '`1`' }
          ],
          'one',
          {
            explainMd:
              'Every call to `counter` runs the body again and creates a fresh `total`, so each returned function closes over its own. The two tallies are completely independent, which is exactly the property that makes closures a safe alternative to a module-level counter shared by everyone.'
          }
        ),
        tf(
          'nonlocal-vs-global',
          '`nonlocal` binds to a name in the nearest enclosing function, not at module level.',
          true,
          {
            explainMd:
              'True. `nonlocal` searches the enclosing function scopes and fails at compile time if no such name exists, which makes it much harder to misuse than `global`. Reach for it only when the inner function genuinely needs to update state the outer one owns.'
          }
        ),
        pyCode({
          id: 'running-tally',
          prompt:
            '> Finish `tally()` so the function it returns keeps a running total across calls. After `add(4)` then `add(5)`, the printed line should be `9`.',
          equals: '9',
          ast: 'nonlocal',
          hidden: true,
          hints: ladder(
            'The starter prints `5`, so the earlier `add(4)` was forgotten. The inner function reads `total` but never updates it.',
            'Assigning to `total` inside `add` would create a local. Declare `nonlocal total` first so the assignment lands on the enclosing name.',
            '`def gate(): open = False` with an inner `def toggle(): nonlocal open; open = not open` flips one shared flag rather than a copy.',
            'def tally():\n    total = 0\n\n    def add(n):\n        nonlocal total\n        total = total + n\n        return total\n\n    return add\n\n\nadd = tally()\nadd(4)\nprint(add(5))'
          )
        })
      ]
    }),
    files: {
      'main.py': `def tally():
    total = 0

    def add(n):
        return total + n

    return add


add = tally()
add(4)
print(add(5))
`,
      'hidden_test.py': importAssert(`add = main.tally()
assert add(4) == 4
assert add(5) == 9
assert add(1) == 10
other = main.tally()
assert other(1) == 1, "each tally needs its own total"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'lambda-and-key',
      courseId: 'functions',
      moduleId: 'scope',
      title: 'A function too small for a name',
      skillIds: ['python.functions'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'One expression, handed straight to another function',
          idea:
            '`lambda` builds a function from a single expression and hands it back without giving it a name. It is the same kind of object a `def` produces — you can call it, pass it, and store it — but it fits inside an argument list, which is where it earns its keep.',
          bites:
            'This bites when it is used as a substitute for `def`. A lambda cannot hold a statement, a loop, or a docstring, so the moment the logic grows the line turns unreadable and the traceback shows an anonymous frame. The one place it is clearly right is a `key=` argument: `sorted`, `min`, `max`, and friends all take a function that says what to compare.',
          code: `double = lambda n: n * 2      # legal, but a def would read better
print(double(4))              # 8

tags = ["owl", "fox-den", "ax"]
print(sorted(tags))                        # ['ax', 'fox-den', 'owl']
print(sorted(tags, key=len))               # ['ax', 'owl', 'fox-den']
print(sorted(tags, key=lambda t: t[-1]))   # ['owl', 'fox-den', 'ax']`,
          mistake:
            'A common mistake is calling the function in the argument — `key=len(tag)` passes a number where a function belongs. Pass the function itself and let `sorted` call it once per item. The exercise sorts station tags shortest first, with ties broken alphabetically, which needs a key that returns two things at once.'
        }),
        predict(
          'key-is-a-function',
          'What does `sorted(tags, key=len)` compare?',
          [
            { id: 'items', md: 'The tags themselves, then their lengths as a tiebreak' },
            { id: 'lengths', md: 'The result of calling `len` on each tag' }
          ],
          'lengths',
          {
            explainMd:
              '`sorted` calls the key function once per item and orders the items by whatever comes back, so `key=len` sorts purely by length and leaves equal-length tags in their original relative order. The original values are still what you get in the result — the key only decides the ordering.'
          }
        ),
        tf(
          'lambda-statements',
          'A `lambda` body can contain an `if` statement and a `return`.',
          false,
          {
            explainMd:
              'It cannot. A lambda holds exactly one expression, and its value is returned automatically, so there is no room for statements. A conditional *expression* like `lambda n: "hi" if n else "lo"` is allowed, but the moment you want a real branch or a loop, write a `def`.'
          }
        ),
        pyCode({
          id: 'sort-the-tags',
          prompt:
            '> Finish `by_length(tags)` so it sorts shortest first and breaks ties alphabetically, using a `lambda` as the key. The printed line should be `[\'ax\', \'owl\', \'fox-den\', \'north-gate\']`.',
          equals: "['ax', 'owl', 'fox-den', 'north-gate']",
          ast: 'lambda',
          hidden: true,
          hints: ladder(
            'The starter sorts alphabetically, so `fox-den` comes before `owl` even though it is much longer.',
            'Pass a `key=` whose lambda returns the length. To break ties, return a tuple of the length and the tag — tuples compare element by element.',
            '`sorted(words, key=lambda w: (len(w), w))` orders `["be", "ax", "cod"]` as `["ax", "be", "cod"]`: length first, and the two-letter pair falls through to the alphabetical part.',
            'TAGS = ["fox-den", "owl", "north-gate", "ax"]\n\n\ndef by_length(tags):\n    return sorted(tags, key=lambda tag: (len(tag), tag))\n\n\nprint(by_length(TAGS))'
          )
        })
      ]
    }),
    files: {
      'main.py': `TAGS = ["fox-den", "owl", "north-gate", "ax"]


def by_length(tags):
    return sorted(tags)


print(by_length(TAGS))
`,
      'hidden_test.py': importAssert(`assert main.by_length(["fox-den", "owl", "north-gate", "ax"]) == ["ax", "owl", "fox-den", "north-gate"]
assert main.by_length(["bbb", "a", "cc"]) == ["a", "cc", "bbb"]
assert main.by_length(["dd", "cc"]) == ["cc", "dd"]
assert main.by_length([]) == []`)
    }
  })

  out.push({
    doc: lesson({
      id: 'greeting-bot',
      courseId: 'functions',
      moduleId: 'scope',
      title: 'Greeting bot',
      skillIds: ['python.functions', 'python.io.stdio', 'python.control.if'],
      estimatedMinutes: 22,
      creation: {
        id: 'greeting-bot',
        step: 2,
        briefMd:
          'Step two finishes the greeting bot: `greet(name)` becomes a reusable function that hands its sentence back, and it stays sensible when nobody typed a name. Keep this file — the station reuses it whenever someone signs in.'
      },
      blocks: [
        teach({
          heading: 'A greeting you can hand to the rest of the program',
          idea:
            'Step one wrote the sentence once with an f-string. Step two turns it into something the station can rely on: a function that **returns** its line, and that copes with the case where the sign-in sheet is blank. Returning rather than printing is what lets the same function feed a screen, a log file, or a test.',
          bites:
            'This bites on the empty name. Gluing an empty string into the sentence produces `Hello, !`, which looks like a bug to everyone who reads it, and gluing `None` in raises `TypeError` before anything is printed at all. One guard at the top of the function handles both, because `None` and `""` are both falsy.',
          code: `def sign_off(name):
    if not name:
        return "Goodbye!"
    return f"Goodbye, {name}!"


print(sign_off("Rune"))   # Goodbye, Rune!
print(sign_off(""))       # Goodbye!
print(sign_off(None))     # Goodbye!`,
          mistake:
            'A common mistake is testing `if name == ""` and leaving `None` to crash the concatenation later. A falsy check covers every "nothing was entered" case at once. The exercise wants the two prints below the function to show the named greeting and then the bare one, and the function must produce both lines by returning them.'
        }),
        predict(
          'empty-name',
          'What does `"Hello, " + name + "!"` produce when `name` is `""`?',
          [
            { id: 'bare', md: '`Hello!`' },
            { id: 'broken', md: '`Hello, !`' }
          ],
          'broken',
          {
            explainMd:
              'Concatenation is literal: the empty string contributes nothing, but the comma and the space you typed are still there, so the line reads `Hello, !`. Nothing raises, which is why this reaches real users. A guard that returns a different sentence for a missing name is the only fix that reads well.'
          }
        ),
        check(
          'which-guard',
          'Which guard covers both an empty string and a missing `None`?',
          [
            { id: 'eq', md: '`if name == "":`' },
            { id: 'falsy', md: '`if not name:`' },
            { id: 'isnone', md: '`if name is None:`' }
          ],
          'falsy',
          {
            explainMd:
              '`not name` is true for `""`, for `None`, and for anything else empty, so one line handles every "nothing was entered" case. The `==` version misses `None` and the `is None` version misses the empty string, and either gap shows up as a broken greeting the first time the sign-in sheet is left blank.'
          }
        ),
        pyCode({
          id: 'greet-fn',
          prompt:
            '> Finish `greet(name)` so it returns `Hello, Ada!` for a name and `Hello!` when the name is empty or missing. The two prints below should show those two lines.',
          equals: 'Hello, Ada!\nHello!',
          ast: 'def greet',
          hidden: true,
          hints: ladder(
            'Run the starter. The second line reads `Hello, !`, because the empty name still left the comma behind.',
            'Guard first: when the name is falsy, return the bare greeting and stop. Everything below the guard can then assume a real name.',
            '`if not tag: return "unnamed"` at the top of a function lets the rest of the body deal with only the normal case.',
            'def greet(name):\n    if not name:\n        return "Hello!"\n    return f"Hello, {name}!"\n\n\nprint(greet("Ada"))\nprint(greet(""))'
          )
        }),
        reflect(
          'bot-next',
          'In your own words: what else should the greeting bot refuse or clean up before it is safe to point at a real sign-in sheet?'
        )
      ]
    }),
    files: {
      'main.py': `def greet(name):
    return "Hello, " + name + "!"


print(greet("Ada"))
print(greet(""))
`,
      'hidden_test.py': importAssert(`assert main.greet("Ada") == "Hello, Ada!"
assert main.greet("Rune") == "Hello, Rune!"
assert main.greet("") == "Hello!"
assert main.greet(None) == "Hello!"`)
    }
  })

  return out
}
