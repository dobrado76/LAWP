import { lesson, teach, predict, check, cloze, tf, ladder, pyCode } from './lib.mjs'

/** The station log the read-and-write module keeps coming back to. Four real lines. */
const STATION_LOG = `06:12 fox NE ok
06:40 fox E ok
07:05 grid ping ok
07:31 fox S drift`

/** The same log, longer, with three lines that end in the word the learner counts. */
const DRIFT_LOG = `06:12 fox NE ok
06:40 fox E drift
07:05 grid ping ok
07:31 fox S drift
07:58 grid ping ok
08:20 fox W drift`

/** Messy on purpose: trailing spaces, blank lines, a comment, shouting. */
const MESSY_LOG = [
  '  06:12  FOX ne ok  ',
  '',
  '# calibration pass, ignore',
  '06:40 fox e DRIFT',
  '07:05   GRID ping ok',
  '',
  '07:31  fox s drift'
].join('\n')

export function lessonsMachine() {
  const out = []

  out.push({
    doc: lesson({
      id: 'open-and-with',
      courseId: 'files',
      moduleId: 'read-write',
      title: 'The block that closes the file',
      skillIds: ['python.io.files'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Opening a file is a promise to close it',
          idea:
            'Opening a file hands you a file object and leaves you owing the operating system one thing: close it. `with open(path) as f:` makes the block keep that promise for you. The moment control leaves the indented body the file is closed, whether the body ran to the end, hit a `return`, or raised.',
          bites:
            'Writing is where this bites. Text you hand to `write` sits in a buffer until the file is closed or flushed, so a tool that opens a report, writes it, and never closes it can leave an empty file on disk and no error anywhere. On Windows the same open handle also stops you renaming or deleting that file, which is the next thing a report tool wants to do.',
          code: `with open("station.log", encoding="utf-8") as f:
    text = f.read()

# out here the file is already closed
print(len(text.splitlines()))`,
          mistake:
            'A common mistake is trusting the interpreter to tidy up because it usually seems to. That is reference-counting luck, not a rule, and it vanishes the moment something still holds the object or an exception is on its way up the stack. The exercise makes you write a count and read it straight back, so an unclosed file shows up as nothing on disk.'
        }),
        predict(
          'with-on-error',
          'A `with open("report.txt", "w") as out:` block raises `ValueError` halfway through the body. Is the file closed?',
          [
            { id: 'leaked', md: 'No — the exception jumps out before any cleanup runs' },
            { id: 'closed', md: 'Yes — leaving the block closes it, normally or by exception' }
          ],
          'closed',
          {
            explainMd:
              'That is the whole point of the block form. `with` installs the cleanup before the body starts, so the file is closed on every way out — falling off the end, a `return`, a `break`, or an exception travelling up the stack. Nothing in the body has to remember.'
          }
        ),
        check(
          'leak-open',
          'You call `out = open("report.txt", "w", encoding="utf-8")`, call `out.write("total=41")`, and never close it. What is guaranteed to be on disk?',
          [
            { id: 'flushed', md: '`total=41` — a file object closes itself after each write', misconceptionId: 'file-closes-itself' },
            { id: 'nothing', md: 'Nothing yet — the text can still be sitting in a buffer' }
          ],
          'nothing',
          {
            explainMd:
              'Text you pass to `write` is buffered and only reaches the disk on a `flush` or a close. Nothing in the language promises either happens at a moment that helps you, so an unclosed file can be empty or half written while your program is still running — and it stays locked the whole time.'
          }
        ),
        pyCode({
          id: 'with-count',
          prompt:
            '> Read `station.log`, write its line count into `count.txt`, then read `count.txt` back and print what it holds. Use a `with` block for every open. Output should be `4`.',
          equals: '4',
          ast: 'with open',
          fixtures: ['station.log'],
          hidden: true,
          hints: ladder(
            'Three opens, three blocks: read the log, write the count, read the count back. The starter has the logic right and the discipline missing.',
            '`with open(path) as f:` closes the file when the indented body ends. To write, name the mode: `with open(path, "w", encoding="utf-8") as out:`.',
            'A different file: `with open("readings.txt", encoding="utf-8") as f:` then `rows = f.read().splitlines()` leaves `len(rows)` usable after the block, because the value outlived the file object.',
            `with open("station.log", encoding="utf-8") as f:
    lines = f.read().splitlines()

with open("count.txt", "w", encoding="utf-8") as out:
    out.write(str(len(lines)))

with open("count.txt", encoding="utf-8") as f:
    print(f.read())`
          )
        })
      ]
    }),
    files: {
      'station.log': STATION_LOG,
      'main.py': `f = open("station.log", encoding="utf-8")
lines = f.read().splitlines()

out = open("count.txt", "w", encoding="utf-8")
out.write(str(len(lines)))

with open("count.txt", encoding="utf-8") as check:
    print(check.read())
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert src.count("with open") >= 2, "use a with block for the write as well as the read"
assert Path("count.txt").read_text(encoding="utf-8").strip() == "4", "count.txt should hold the line count"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'read-lines-without-slurping',
      courseId: 'files',
      moduleId: 'read-write',
      title: 'One line at a time',
      skillIds: ['python.io.files'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'A file object is a line iterator',
          idea:
            'A file object iterates over its own lines. `for line in f:` hands you one line per turn and never holds more than a buffer in memory, so the same three lines of code work on a four-line station log and on a four-million-line sensor dump.',
          bites:
            'Two things bite here. `f.read()` pulls the whole file into one string, which is fine for a log you can print and ruinous for a day of readings. And every line a file object hands you still carries the newline that ended it, so `line == "ok"` and `line.endswith("drift")` quietly answer `False` on every line except possibly the last.',
          code: `with open("station.log", encoding="utf-8") as f:
    for line in f:
        print(repr(line))     # '06:12 fox NE ok\\n' — the newline is part of the line

text = "a\\nb\\n"
print(text.splitlines())      # ['a', 'b'] — the newline ended a line
print(text.split("\\n"))       # ['a', 'b', ''] — and left an empty tail`,
          mistake:
            'A common mistake is reaching for `.read()` and then splitting, out of habit. Iterate when you only need one line at a time, and strip the newline before you compare anything. The exercise counts the lines that end with one particular word, so the invisible newline decides whether you get the right answer or zero.'
        }),
        predict(
          'newline-endswith',
          'A log line in the middle of a file is `"06:40 fox E drift\\n"`. What does `line.endswith("drift")` return?',
          [
            { id: 'yes', md: '`True` — the line does end with `drift`' },
            { id: 'no', md: '`False` — the newline is the last character' }
          ],
          'no',
          {
            explainMd:
              'The newline that separated this line from the next one is still on the end of the string the file handed you, so the real final character is `"\\n"`. `endswith` compares the actual end, and it keeps saying `False` until you call `line.rstrip("\\n")` or `line.strip()` first.'
          }
        ),
        check(
          'split-vs-splitlines',
          'For `text = "a\\nb\\n"`, which expression gives exactly `["a", "b"]`?',
          [
            { id: 'splitlines', md: '`text.splitlines()`' },
            { id: 'split', md: '`text.split("\\n")`' }
          ],
          'splitlines',
          {
            explainMd:
              '`splitlines()` treats a newline as the thing that *ends* a line, so a trailing newline does not invent an extra item. `text.split("\\n")` splits strictly between separators and hands back `["a", "b", ""]`; that empty string at the end is the bug you find two functions later.'
          }
        ),
        pyCode({
          id: 'count-drift',
          prompt:
            '> Count the lines of `station.log` that end with `drift`, walking the file one line at a time. Do not call `.read()` or `.readlines()`. Print the count.',
          equals: '3',
          ast: 'for line in',
          fixtures: ['station.log'],
          hidden: true,
          hints: ladder(
            'The loop is already right and the answer is already wrong. Print one line with `repr(line)` and look at what is on the end of it.',
            'Each line still carries its newline. Remove it with `line.rstrip("\\n")` — or `line.strip()`, which also drops spaces — before you ask `endswith`.',
            'The same habit on a different question: `for line in f:` then `if not line.strip(): blanks += 1` counts blank lines, and would count every line if you forgot the strip.',
            `count = 0

with open("station.log", encoding="utf-8") as f:
    for line in f:
        if line.rstrip("\\n").endswith("drift"):
            count += 1

print(count)`
          )
        })
      ]
    }),
    files: {
      'station.log': DRIFT_LOG,
      'main.py': `count = 0

with open("station.log", encoding="utf-8") as f:
    for line in f:
        if line.endswith("drift"):
            count += 1

print(count)
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert ".read()" not in src, "walk the file line by line instead of reading all of it at once"
assert ".readlines()" not in src, "readlines() builds the whole list; iterate the file object instead"
assert "for line in" in src, "iterate the file object itself: for line in f:"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'write-text-safely',
      courseId: 'files',
      moduleId: 'read-write',
      title: 'Write it without losing the old one',
      skillIds: ['python.io.files'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'The mode decides what happens to what was there',
          idea:
            'The mode string you pass to `open` is a decision about the existing file. `"w"` truncates it to nothing the moment it opens, before your first `write`. `"a"` keeps every old byte and adds to the end. `"x"` refuses to open at all if the file already exists.',
          bites:
            'Two silent failures live here. Leaving out `encoding="utf-8"` makes the bytes depend on whatever code page the machine happens to prefer, so a report written on one computer arrives as mojibake on another. And writing straight over the real file means a crash halfway through leaves a half-written report where a complete one used to be.',
          code: `import os

with open("report.tmp", "w", encoding="utf-8") as out:
    out.write("total=41")

# one step, not two: afterwards the file is either the old one or the new one
os.replace("report.tmp", "report.txt")`,
          mistake:
            'A common mistake is opening in `"a"` to feel safe and ending up with yesterday report glued to today. Choose the mode on purpose: `"w"` to replace, `"a"` to add a line to a log you keep. The exercise starts with yesterday report still on disk, so appending shows up in the very first run.'
        }),
        predict(
          'w-truncates',
          '`report.txt` holds `total=99`. You run `open("report.txt", "w", encoding="utf-8")` and then your program crashes before writing anything. What is in the file?',
          [
            { id: 'kept', md: '`total=99` — nothing was written, so nothing changed' },
            { id: 'empty', md: 'Nothing — `"w"` emptied it at open time' }
          ],
          'empty',
          {
            explainMd:
              'Truncation happens when the file is opened, not when you write. Mode `"w"` is a promise that the old contents are already gone, which is exactly why a careful tool writes to a temporary name first and only swaps it over the real file once the new text is complete.'
          }
        ),
        check(
          'append-vs-write',
          'Yesterday `report.txt` holds `total=99`. You open it with `"a"` and write `total=41`. What does the file hold now?',
          [
            { id: 'replaced', md: '`total=41`' },
            { id: 'both', md: '`total=99total=41`' }
          ],
          'both',
          {
            explainMd:
              'Append mode never removes anything: it parks the file position at the end and adds from there. You get both records run together, with no newline between them unless you wrote one, which is how a mode chosen to feel safe quietly corrupts a report.'
          }
        ),
        pyCode({
          id: 'swap-report',
          prompt:
            '> Total the numbers in `readings.txt`, write `total=<sum>` into `report.tmp`, then use `os.replace` to swap it over `report.txt`. Read `report.txt` back and print it. Name `encoding="utf-8"` on every text open. Expected `total=41`.',
          equals: 'total=41',
          ast: 'os.replace',
          fixtures: ['readings.txt', 'report.txt'],
          hidden: true,
          hints: ladder(
            'Yesterday report is still on disk, and the starter is adding to it instead of replacing it. Look at what it printed.',
            'Write the new text under a second name — `report.tmp`, mode `"w"`, `encoding="utf-8"` — and then `os.replace("report.tmp", "report.txt")` moves it over the old one in a single step.',
            'The same shape for any file you rewrite: build `notes.tmp`, then `os.replace("notes.tmp", "notes.txt")`. A crash before the replace leaves the complete old file untouched.',
            `import os

with open("readings.txt", encoding="utf-8") as f:
    numbers = [int(line) for line in f]

with open("report.tmp", "w", encoding="utf-8") as out:
    out.write("total=" + str(sum(numbers)))

os.replace("report.tmp", "report.txt")

with open("report.txt", encoding="utf-8") as f:
    print(f.read())`
          )
        })
      ]
    }),
    files: {
      'readings.txt': `12
17
12`,
      'report.txt': `total=99`,
      'main.py': `with open("readings.txt", encoding="utf-8") as f:
    numbers = [int(line) for line in f]

with open("report.txt", "a", encoding="utf-8") as out:
    out.write("total=" + str(sum(numbers)))

with open("report.txt", encoding="utf-8") as f:
    print(f.read())
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert 'encoding="utf-8"' in src or "encoding='utf-8'" in src, "name the encoding on every text open"
assert "replace" in src, "write to a temp name, then os.replace it over the real file"
assert not Path("report.tmp").exists(), "report.tmp should be gone once the swap is done"
assert Path("report.txt").read_text(encoding="utf-8").strip() == "total=41", "report.txt should hold the new total only"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'pathlib-paths',
      courseId: 'files',
      moduleId: 'read-write',
      title: 'A path is an object',
      skillIds: ['python.io.files'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Ask the path instead of chopping the string',
          idea:
            '`Path` from `pathlib` models a location instead of describing one. The `/` operator joins another piece on and inserts whatever separator this operating system uses, and the object answers questions about itself: `.name` is the last piece, `.stem` is that piece without its extension, `.suffix` is the extension, `.parent` is the folder above.',
          bites:
            'Gluing text is where it bites. `folder + "/" + name` works on your machine until `folder` already ends in a separator and you ship `logs//day.log`, or until the folder came from a Windows setting and you are now mixing two separators in one string. The object also carries the toolbox with it: `.mkdir()`, `.exists()`, `.read_text()`, `.write_text()`.',
          code: `from pathlib import Path

path = Path("logs") / "north" / "day.log"

print(path.name, path.stem, path.suffix)   # day.log day .log
print(path.parent.name)                    # north`,
          mistake:
            'A common mistake is building the path as text and then interrogating it with string methods, where `path.split(".")[0]` stops being the stem the moment a folder name contains a dot. Let the `Path` answer. The exercise makes a folder, writes a file into it, and prints the stem and suffix, so there is nothing left for `+` to do.'
        }),
        check(
          'glue-vs-join',
          'You need the file `station.log` inside the folder `reports`. Which one is safe on any machine?',
          [
            { id: 'glue', md: '`"reports" + "/" + "station.log"`', misconceptionId: 'paths-are-just-strings' },
            { id: 'joined', md: '`Path("reports") / "station.log"`' }
          ],
          'joined',
          {
            explainMd:
              'A path is not a sentence you assemble by hand. `Path` joins the pieces with the separator this system expects and copes with a folder that already ends in one, so you never ship the double slash or the mixed separators that only appear on somebody else machine. The result also knows how to read and write itself.'
          }
        ),
        cloze(
          'path-parts',
          'For `Path("notes/station.log")`, `.name` is {{a}} and `.stem` is {{b}}.',
          [
            { id: 'a', choices: ['station.log', 'station', '.log'] },
            { id: 'b', choices: ['station', 'station.log', 'notes'] }
          ],
          { a: 'station.log', b: 'station' },
          {
            explainMd:
              '`.name` is the last piece of the path with its extension still attached. `.stem` is that same piece with the final extension removed and `.suffix` is the extension on its own, so `.stem + .suffix` puts `.name` back together again.'
          }
        ),
        pyCode({
          id: 'build-path',
          prompt:
            '> Using `pathlib` only: make the folder `reports`, write `ok` into `reports/station.log`, then print the stem, the suffix, and the text you read back — `station .log ok`.',
          equals: 'station .log ok',
          ast: 'Path(',
          hidden: true,
          hints: ladder(
            'Everything in this task is a method on a `Path`: making the folder, writing the file, reading it back, and naming its parts.',
            '`folder = Path("reports")` then `folder.mkdir(exist_ok=True)`, then `path = folder / "station.log"`. `write_text` and `read_text` both take `encoding="utf-8"`.',
            'A different path answers the same way: `p = Path("out") / "day.csv"` has `.stem` `"day"`, `.suffix` `".csv"`, and `.parent` `Path("out")` — no string surgery anywhere.',
            `from pathlib import Path

folder = Path("reports")
folder.mkdir(exist_ok=True)

path = folder / "station.log"
path.write_text("ok", encoding="utf-8")

print(path.stem, path.suffix, path.read_text(encoding="utf-8"))`
          )
        })
      ]
    }),
    files: {
      'main.py': `from pathlib import Path

path = "reports" + "/" + "station.log"

print(path.split(".")[0], ".log", "ok")
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "Path(" in src, "build the path with Path, not with + and a separator"
assert '"/"' not in src, "do not glue the pieces together with a slash of your own"
assert ".stem" in src, "ask the path for its .stem"
assert ".suffix" in src, "ask the path for its .suffix"
assert Path("reports/station.log").read_text(encoding="utf-8").strip() == "ok", "reports/station.log should hold ok"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'json-roundtrip',
      courseId: 'files',
      moduleId: 'records',
      title: 'What survives the trip',
      skillIds: ['python.io.json'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'JSON knows six shapes',
          idea:
            'JSON is text, and it can describe six things: object, array, string, number, true or false, and null. `json.dumps(value)` writes your Python value as that text and `json.loads(text)` builds a new value from it. Anything Python can hold that JSON cannot describe is either converted on the way out or refused outright.',
          bites:
            'The conversions bite because they are silent. A tuple goes out as an array and comes back a `list`. A dict key that was the number `7` goes out as `"7"`, because JSON object keys are always strings, and comes back as the string. A `set`, a `datetime`, or an instance of your own class is not converted at all — `json.dumps` raises `TypeError` and names the type it refused.',
          code: `import json

text = json.dumps({"grid": (3, 2), 7: "fox"})
print(text)                           # {"grid": [3, 2], "7": "fox"}

back = json.loads(text)
print(type(back["grid"]).__name__)    # list`,
          mistake:
            'A common mistake is treating a round trip as a copy and then comparing the result to the original with `==`. It will not match if any tuple or non-string key was involved, and the mismatch turns up far away from the `dumps` that caused it. The exercise makes you prove both changes once, deliberately.'
        }),
        predict(
          'tuple-out',
          'What does `json.loads(json.dumps({"a": (1, 2)}))["a"]` give you?',
          [
            { id: 'tup', md: '`(1, 2)` — a tuple' },
            { id: 'lst', md: '`[1, 2]` — a list' }
          ],
          'lst',
          {
            explainMd:
              'JSON has exactly one sequence shape, the array, so the tuple is written as `[1, 2]`. Reading that array back produces a list, because a list is what an array means in Python. The tuple-ness was information the text never carried, so there is nothing to restore it from.'
          }
        ),
        check(
          'set-refused',
          'What does `json.dumps({"seen": {1, 2}})` do?',
          [
            { id: 'arr', md: 'Writes `{"seen": [1, 2]}` — a set becomes an array' },
            { id: 'boom', md: 'Raises `TypeError` — a set is not JSON-serialisable' }
          ],
          'boom',
          {
            explainMd:
              'A tuple is converted because JSON has an obvious equivalent. A set is not, because JSON has no unordered collection and any order chosen for you would be a guess. `json.dumps` refuses instead, so you convert it yourself with `sorted(value)` and own the order.'
          }
        ),
        pyCode({
          id: 'roundtrip',
          prompt:
            '> `record` holds a tuple and an integer key. Round-trip it through `json.dumps` and `json.loads` into `back`, then print the kind name of `back["grid"]` and whether the string `"7"` is a key of `back`. Expected `list True`.',
          equals: 'list True',
          ast: 'json.dumps',
          hidden: true,
          hints: ladder(
            'Nothing in the starter ever leaves Python, so nothing can change. The trip is out to text and back again.',
            '`json.dumps(record)` gives you the JSON text; `json.loads(text)` builds a new dict from that text. You can do both in one expression or keep the text in a name and look at it.',
            'On another value: `json.loads(json.dumps({"tags": ("a", "b")}))["tags"]` is `["a", "b"]`, and `type(...).__name__` on it is `"list"`.',
            `import json

record = {"station": "north", "grid": (3, 2), 7: "fox"}
back = json.loads(json.dumps(record))

print(type(back["grid"]).__name__, "7" in back)`
          )
        })
      ]
    }),
    files: {
      'main.py': `import json

record = {"station": "north", "grid": (3, 2), 7: "fox"}
back = record

print(type(back["grid"]).__name__, "7" in back)
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "json.dumps" in src, "write the record out as JSON text with json.dumps"
assert "json.loads" in src, "read that text back with json.loads"

import main

assert isinstance(main.back, dict), "back should be the dict json.loads built"
assert main.back["grid"] == [3, 2], "a tuple comes back as a list"
assert "7" in main.back, 'an integer key comes back as the string key "7"'
assert 7 not in main.back, "the integer key itself does not survive"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'csv-rows',
      courseId: 'files',
      moduleId: 'records',
      title: 'The comma inside the field',
      skillIds: ['python.io.json'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'CSV is not "split on commas"',
          idea:
            'A CSV file is not a file where commas separate fields. It is a file where commas separate fields *unless* the field is quoted, and a quoted field may itself contain commas, newlines, and doubled quote characters. The `csv` module knows all of those rules. `str.split` knows none of them.',
          bites:
            '`csv.reader` hands you each row as a list of already-unquoted fields. `csv.DictReader` reads the header line first and hands you each row as a dict keyed by column name, which keeps working when somebody inserts a column. Open the file with `newline=""` so the module sees the line endings raw, because a quoted field is allowed to contain one.',
          code: `import csv

with open("stations.csv", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        print(row["station"], row["drift"])

line = 'north,"fox, then owl",2'
print(len(line.split(",")))   # 4 — the quoted comma cut the note in half`,
          mistake:
            'A common mistake is indexing the pieces of a naive split by position, which puts a fragment of somebody note where a number should be. The failure is a wrong value rather than an exception, so it survives review. The exercise has one station whose note holds two commas, so the totals stay right while the note comes out truncated.'
        }),
        predict(
          'naive-split',
          'A row reads `north,"fox, then owl",2`. How many pieces does splitting it on every comma produce?',
          [
            { id: 'three', md: '3 — one per column' },
            { id: 'four', md: '4 — the comma inside the quotes counts too' }
          ],
          'four',
          {
            explainMd:
              'Splitting cannot see the quotes, so the note is cut in half and a three-column row yields four pieces. Every field after the quoted one has shifted by one index, which is why this shows up as a wrong number in a report rather than as an error at the point of the split.'
          }
        ),
        check(
          'newline-arg',
          'Which `open` call is right for handing a file to `csv.DictReader`?',
          [
            { id: 'plain', md: '`open(path, encoding="utf-8")`' },
            { id: 'rawnl', md: '`open(path, encoding="utf-8", newline="")`' }
          ],
          'rawnl',
          {
            explainMd:
              'The `csv` module does its own line-ending handling, because a quoted field may contain a newline that belongs to the field and not to the row. Passing `newline=""` turns off the translation `open` would otherwise apply, so a row spread over two lines is still read as one row.'
          }
        ),
        pyCode({
          id: 'csv-report',
          prompt:
            '> Read `stations.csv` with `csv.DictReader`. Print the total of the `drift` column and the `note` of the station with the highest drift — `7 ping, ping, ping`.',
          equals: '7 ping, ping, ping',
          ast: 'DictReader',
          fixtures: ['stations.csv'],
          hidden: true,
          hints: ladder(
            'The total is already right. Look at the note it printed and compare it with the row in the file.',
            '`csv.DictReader(f)` reads the header and then gives you `row["station"]`, `row["note"]`, and `row["drift"]` per row, quoted commas kept whole. `row["drift"]` is still text, so wrap it in `int(...)`.',
            'The same loop on another file: `for row in csv.DictReader(f): total += int(row["count"])` — and you never have to know which column number `count` is.',
            `import csv

total = 0
note = ""
most = -1

with open("stations.csv", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        drift = int(row["drift"])
        total += drift
        if drift > most:
            most = drift
            note = row["note"]

print(total, note)`
          )
        })
      ]
    }),
    files: {
      'stations.csv': `station,note,drift
north,"fox, then owl",2
ridge,quiet,0
creek,"ping, ping, ping",5`,
      'main.py': `total = 0
note = ""
most = -1

with open("stations.csv", encoding="utf-8") as f:
    rows = f.read().splitlines()[1:]

for row in rows:
    parts = row.split(",")
    drift = int(parts[-1])
    total += drift
    if drift > most:
        most = drift
        note = parts[1]

print(total, note)
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "DictReader" in src, "let csv.DictReader split the row and name the columns"
assert '.split(",")' not in src, "a quoted field can hold a comma, so never split a row on commas"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'dirs-and-globs',
      courseId: 'files',
      moduleId: 'records',
      title: 'Finding files without guessing',
      skillIds: ['python.io.files'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Match a pattern, then sort the answer',
          idea:
            '`Path.glob("*.log")` looks inside one folder and yields every entry whose name matches the pattern. `Path.rglob("*.log")` runs the same match at every depth below that folder. Both are generators: they hand you paths as the filesystem reports them, one at a time, without building a list first.',
          bites:
            'Two habits keep this honest. Filesystem order is not sorted and is not the same on two machines, so wrap the result in `sorted(...)` the moment the output is printed, compared, or written to a report. And make the folder before you write into it: `folder.mkdir(parents=True, exist_ok=True)` creates every missing level and stays quiet when the folder is already there, so a second run does not raise `FileExistsError`.',
          code: `from pathlib import Path

folder = Path("logs") / "north"
folder.mkdir(parents=True, exist_ok=True)
(folder / "day.log").write_text("ok\\n", encoding="utf-8")

print([p.as_posix() for p in sorted(Path("logs").rglob("*.log"))])`,
          mistake:
            'A common mistake is running `glob("*.log")` on the top folder, finding nothing, and concluding there are no logs when they sit one level down. Choose `rglob` when the tree has depth. The exercise builds two station folders and then finds their logs, so an unsorted answer passes on one machine and fails on the next.'
        }),
        check(
          'glob-depth',
          'The only log file is `logs/north/day.log`. What does `list(Path("logs").glob("*.log"))` return?',
          [
            { id: 'found', md: 'One path — `logs/north/day.log`' },
            { id: 'empty', md: 'An empty list — `glob` looks in one folder only' }
          ],
          'empty',
          {
            explainMd:
              '`glob("*.log")` matches the entries directly inside `logs`, and the only entry there is the folder `north`, whose name does not end in `.log`. To match further down you spell out the level with `glob("*/*.log")`, or use `rglob("*.log")`, which repeats the match at every depth.'
          }
        ),
        tf('glob-order', '`Path.rglob` yields its matches in sorted order.', false, {
          explainMd:
            'The order comes from the filesystem, so it can depend on the drive, the operating system, and the order the files were created in. Anything you print, compare, or write into a report should go through `sorted(...)` first, or the same script gives two different answers on two machines.'
        }),
        pyCode({
          id: 'build-tree',
          prompt:
            '> Make `logs/north` and `logs/ridge`, each in a single `mkdir` call that survives a second run, and write a `day.log` into each. Then print the folder names of the logs `rglob` finds, sorted and space-separated — `north ridge`.',
          equals: 'north ridge',
          ast: 'rglob',
          hidden: true,
          hints: ladder(
            'Nothing exists yet, so the search finds nothing and prints an empty line. Build the two folders and their files first.',
            '`(Path("logs") / name).mkdir(parents=True, exist_ok=True)` makes both levels in one call, and `(folder / "day.log").write_text("ok", encoding="utf-8")` puts the file inside it.',
            'Then search from the top and sort: `sorted(Path("logs").rglob("*.log"))`. On another tree, `rglob("*.csv")` is what finds `data/2026/march.csv` without you naming the year.',
            `from pathlib import Path

for name in ("ridge", "north"):
    folder = Path("logs") / name
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "day.log").write_text("ok\\n", encoding="utf-8")

found = sorted(Path("logs").rglob("*.log"))

print(" ".join(p.parent.name for p in found))`
          )
        })
      ]
    }),
    files: {
      'main.py': `from pathlib import Path

found = sorted(Path(".").glob("*.log"))

print(" ".join(p.parent.name for p in found))
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "parents=True" in src, "one mkdir call should make the whole chain: parents=True"
assert "exist_ok=True" in src, "exist_ok=True keeps a second run from raising FileExistsError"
assert "rglob" in src, "rglob matches at every depth; glob only looks in one folder"
assert "sorted" in src, "sort the matches so every machine prints the same line"
assert Path("logs/north/day.log").is_file(), "logs/north/day.log should exist"
assert Path("logs/ridge/day.log").is_file(), "logs/ridge/day.log should exist"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'creation-log-scrubber',
      courseId: 'files',
      moduleId: 'records',
      title: 'The log scrubber reads the real log',
      skillIds: ['python.io.files'],
      estimatedMinutes: 20,
      creation: {
        id: 'log-scrubber',
        step: 2,
        briefMd:
          'Step 2 of the log scrubber. The line cleaner you built earlier now works on the real thing: it reads the station log off disk, drops the noise, and writes `report.txt` — a file you can hand to somebody else.'
      },
      blocks: [
        teach({
          heading: 'From one line to the whole file',
          idea:
            'You already know how to clean one line: strip the ends, collapse the run of spaces in the middle, lower the case. A file is that rule inside a loop, plus two decisions about lines you do not want — the blank ones and the comment ones — and one decision about where the cleaned lines go.',
          bites:
            'A whole-file scrubber has to be safe to run twice, because it will be. Read the messy log, build the cleaned lines in memory, and write them out in one pass; never write into the file you are still reading. And decide what a line of output ends with, because writing `"\\n"` yourself is the difference between a file of lines and one very long line.',
          code: `line = "  06:12  FOX ne ok  "
print(" ".join(line.split()).lower())   # 06:12 fox ne ok

print("# note".startswith("#"))         # True — a comment line to drop
print(bool("   ".strip()))              # False — a blank line to drop`,
          mistake:
            'A common mistake is `line.replace("  ", " ")`, which turns three spaces into two and stops there. `line.split()` with no argument breaks on any run of whitespace and throws the empty pieces away, so `" ".join(line.split())` normalises every gap in one go. The exercise prints how many lines it kept, so one stray blank shows up in the number.'
        }),
        check(
          'collapse-spaces',
          'Which expression turns `"  06:12   FOX  ne "` into `"06:12 FOX ne"`?',
          [
            { id: 'replace', md: '`line.strip().replace("  ", " ")`' },
            { id: 'joinsplit', md: '`" ".join(line.split())`' }
          ],
          'joinsplit',
          {
            explainMd:
              '`replace("  ", " ")` walks the string once, so a run of three spaces becomes two and a run of five becomes three. `split()` with no argument breaks on any run of whitespace and discards the empty pieces, so joining the result with a single space normalises every gap no matter how long it was.'
          }
        ),
        predict(
          'skip-comment',
          'The scrubber keeps a line unless it is blank or starts with `#`. How many of these four survive: `"  06:12 ok "`, `""`, `"# calibration"`, `"07:05 ok"`?',
          [
            { id: 'four', md: 'All four' },
            { id: 'two', md: 'Two' }
          ],
          'two',
          {
            explainMd:
              'The empty line goes because `"".strip()` is falsy, and the calibration line goes because it starts with `#`. Order matters: strip the line first and then test it, or a comment that somebody indented by two spaces slips straight through into the report.'
          }
        ),
        pyCode({
          id: 'scrub-file',
          prompt:
            '> Read `station.log`, drop the blank lines and the `#` comment lines, normalise every surviving line to single-spaced lowercase, and write them to `report.txt`, one per line. Print how many lines you wrote.',
          equals: '4',
          ast: 'report.txt',
          fixtures: ['station.log'],
          hidden: true,
          hints: ladder(
            'The starter copies the log straight across, blank lines and comment and all. The cleaning rule belongs between the read and the write.',
            'Per line: `line = line.strip()`, then `continue` when the line is empty or `line.startswith("#")`, then keep `" ".join(line.split()).lower()` in a list.',
            'Writing a list of lines back out: `for row in cleaned: out.write(row + "\\n")`. The newline is yours to add, and `len(cleaned)` is the number you print.',
            `cleaned = []

with open("station.log", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        cleaned.append(" ".join(line.split()).lower())

with open("report.txt", "w", encoding="utf-8") as out:
    for row in cleaned:
        out.write(row + "\\n")

print(len(cleaned))`
          )
        })
      ]
    }),
    files: {
      'station.log': MESSY_LOG,
      'main.py': `with open("station.log", encoding="utf-8") as f:
    lines = f.read().splitlines()

with open("report.txt", "w", encoding="utf-8") as out:
    for row in lines:
        out.write(row + "\\n")

print(len(lines))
`,
      'hidden_test.py': `from pathlib import Path

expected = [
    "06:12 fox ne ok",
    "06:40 fox e drift",
    "07:05 grid ping ok",
    "07:31 fox s drift",
]

lines = Path("report.txt").read_text(encoding="utf-8").splitlines()
assert lines == expected, "report.txt should hold the four cleaned lines, one per line, but holds " + repr(lines)
`
    }
  })

  out.push({
    doc: lesson({
      id: 'argv-and-env',
      courseId: 'process',
      moduleId: 'inputs',
      title: 'What the world handed you',
      skillIds: ['python.io.stdio'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Arguments and environment arrive before your first line',
          idea:
            'A script does not ask for its input; it is handed some at the moment it starts. `sys.argv` is the list of words from the command line, and `sys.argv[0]` is the script itself, so the first thing the caller actually asked for is `sys.argv[1]`. `os.environ` is the dictionary of environment variables the process inherited.',
          bites:
            'Both surfaces are text, always. `sys.argv[2]` is the string `"3"` and never the number 3, so a missing `int(...)` turns up much later as a joined string or a `TypeError`. And both can be absent: indexing past the end of `argv` raises `IndexError`, and `os.environ["MODE"]` raises `KeyError`, which is why `os.environ.get("MODE", "normal")` is the form worth learning first.',
          code: `import os
import sys

print(sys.argv)                                  # ['main.py', 'ridge', '3']
print(sys.argv[1], int(sys.argv[2]) * 2)         # ridge 6
print(os.environ.get("STATION_MODE", "normal"))  # quiet, if something set it`,
          mistake:
            'A common mistake is reading `sys.argv[0]` as the first argument and printing the script name back at the user. Count from one. This lesson runs your file with `ridge 3` on the command line and `STATION_MODE=quiet` in the environment, and nothing else: `FOX_NAME` is deliberately unset, so your default has to do real work.'
        }),
        check(
          'argv-zero',
          'Your script starts as `python report.py ridge 3`. What is `sys.argv[0]`?',
          [
            { id: 'first', md: '`"ridge"` — the first argument' },
            { id: 'script', md: '`"report.py"` — the script being run' }
          ],
          'script',
          {
            explainMd:
              'The list includes the program itself at index 0, the way the operating system hands it over. Real arguments start at index 1, so `sys.argv[1:]` is the slice that means "what the caller asked for" and `len(sys.argv) - 1` is how many things they asked for.'
          }
        ),
        check(
          'env-missing',
          '`MODE` is not set in the environment. What does `os.environ["MODE"]` do?',
          [
            { id: 'none', md: 'Returns `None`' },
            { id: 'boom', md: 'Raises `KeyError`' }
          ],
          'boom',
          {
            explainMd:
              '`os.environ` is a mapping, so square brackets on a missing name raise `KeyError` exactly as a dict would. `os.environ.get("MODE")` hands back `None` instead, and `os.environ.get("MODE", "normal")` lets you name the fallback you actually want to run with.'
          }
        ),
        pyCode({
          id: 'read-inputs',
          prompt:
            '> Print four things on one line: the station from `sys.argv[1]`, the number in `sys.argv[2]` doubled, `STATION_MODE` from the environment with default `normal`, and `FOX_NAME` from the environment with default `fox`. Expected `ridge 6 quiet fox`.',
          equals: 'ridge 6 quiet fox',
          ast: 'sys.argv[1]',
          argv: ['ridge', '3'],
          env: { STATION_MODE: 'quiet' },
          hidden: true,
          hints: ladder(
            'Two of the four values are already right. The station and the count are being invented instead of read.',
            '`sys.argv[1]` is the station and `sys.argv[2]` is the count as text, so the doubled number is `int(sys.argv[2]) * 2`.',
            'For the environment: `os.environ.get("STATION_MODE", "normal")` gives the value when something set it and `"normal"` when nothing did — no `KeyError` either way, which is what the unset `FOX_NAME` is there to prove.',
            `import os
import sys

station = sys.argv[1]
count = int(sys.argv[2]) * 2
mode = os.environ.get("STATION_MODE", "normal")
name = os.environ.get("FOX_NAME", "fox")

print(station, count, mode, name)`
          )
        })
      ]
    }),
    files: {
      'main.py': `import os
import sys

print(sys.argv[0], 3, os.environ.get("STATION_MODE", "normal"), "fox")
`,
      'hidden_test.py': `import os
import sys
from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "sys.argv[1]" in src, "the first real argument is sys.argv[1]"
assert "sys.argv[0]" not in src, "sys.argv[0] is the script name, not an argument"
assert "environ.get" in src, "os.environ.get lets you name a default instead of raising"
assert sys.argv[1:] == ["ridge", "3"], "this lesson passes ridge and 3 on the command line"
assert os.environ.get("FOX_NAME") is None, "FOX_NAME is unset on purpose, so the default has to work"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'exit-codes-and-stderr',
      courseId: 'process',
      moduleId: 'inputs',
      title: 'Two streams and one number',
      skillIds: ['python.io.stdio'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'The verdict is a number, not a sentence',
          idea:
            'A process ends with a number. Zero means it did what it was asked; anything else means it did not, and that number is the only part of your run a shell, a scheduled task, or a calling script looks at. `sys.exit(0)` and `sys.exit(1)` state it deliberately instead of leaving it to whatever happened last.',
          bites:
            'The two output streams matter for the same reason. `stdout` is the answer — the thing another program reads or a file captures. `stderr` is the commentary: warnings, skipped lines, progress. Print a warning to `stdout` and it lands in the middle of the answer, so the next program in the pipeline tries to parse the words `skipping oops` as data.',
          code: `import sys

print("total=41")                            # the answer
print("skipping line 2", file=sys.stderr)    # the commentary
sys.exit(0)                                  # the verdict`,
          mistake:
            'A common mistake is `print("error: ...")` followed by a normal end, which tells every caller the run succeeded and lets a scheduled job carry on with nothing. Decide what failure means for this tool and exit non-zero for exactly that. Here a file with some unreadable lines is still a success; only a file with nothing usable is a failure.'
        }),
        check(
          'exit-zero-lies',
          'Your script prints `error: no readings` and then reaches the end of the file normally. What does the shell that started it see?',
          [
            { id: 'failed', md: 'A failure — it printed an error' },
            { id: 'ok', md: 'Success — the exit code is 0' }
          ],
          'ok',
          {
            explainMd:
              'Nothing reads your words. Falling off the end of the script is exit code 0, which every caller takes as "it worked", so the scheduled job carries on and the installer reports success. The message and the exit code have to agree, and only something like `sys.exit(1)` sets the second one.'
          }
        ),
        check(
          'which-stream',
          'Your tool prints a report another program will read, plus a warning about one line it skipped. Where does the warning go?',
          [
            { id: 'out', md: '`stdout`, with the report' },
            { id: 'err', md: '`stderr`, so the report stays clean' }
          ],
          'err',
          {
            explainMd:
              'Whoever captures your output wants the report and nothing else in it. `stderr` is a second stream the caller can show a human, redirect into a log, or discard without touching the data, which is why diagnostics belong there even when nothing has actually gone wrong yet.'
          }
        ),
        pyCode({
          id: 'stream-split',
          prompt:
            '> Total the lines of `readings.txt` that are whole numbers. Send one warning per unreadable line to `sys.stderr`, print only the total on `stdout`, and finish with `sys.exit(0)` when at least one number was usable. Expected `30`.',
          equals: '30',
          ast: 'sys.stderr',
          fixtures: ['readings.txt'],
          hidden: true,
          hints: ladder(
            'The total is already right. The problem is that the warning is standing in the middle of the answer, where the next program will read it.',
            '`print(value, file=sys.stderr)` sends that one line to the error stream instead of the answer stream. Everything else you print stays on `stdout`.',
            'Then state the verdict out loud: count the numbers you actually used and end with `sys.exit(0 if used else 1)`, so a file with nothing usable is the only failure.',
            `import sys

total = 0
used = 0

with open("readings.txt", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line.isdigit():
            print("skipping", line, file=sys.stderr)
            continue
        total += int(line)
        used += 1

print(total)
sys.exit(0 if used else 1)`
          )
        })
      ]
    }),
    files: {
      'readings.txt': `9
oops
14
7`,
      'main.py': `import sys

total = 0

with open("readings.txt", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line.isdigit():
            print("skipping", line)
            continue
        total += int(line)

print(total)
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "sys.stderr" in src, "warnings belong on sys.stderr so stdout stays pipeable"
assert "file=" in src, "print(value, file=sys.stderr) is how you pick the stream"
assert "sys.exit(" in src, "say the exit code out loud with sys.exit"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'datetime-and-stamps',
      courseId: 'process',
      moduleId: 'inputs',
      title: 'A stamp is a value',
      skillIds: ['python.modules'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Parse it, work with it, format it back',
          idea:
            'A timestamp in a log is text, and text cannot be subtracted or shifted. `datetime.fromisoformat(text)` turns an ISO 8601 stamp such as `2026-03-14T06:12:00` into a `datetime`, and `.isoformat()` turns one back into that same text. Between those two calls you are holding a value that knows about hours, months, and leap years.',
          bites:
            'Subtracting two datetimes gives a `timedelta` rather than a number: a span, which knows its `.days` and its `.total_seconds()` but has no `.minutes`. Adding `timedelta(minutes=15)` to a datetime gives another datetime, and it rolls over the hour, the day, and the month on the way — which is precisely what slicing digits out of the string cannot do.',
          code: `from datetime import datetime, timedelta

start = datetime.fromisoformat("2026-03-14T06:12:00")
end = datetime.fromisoformat("2026-03-14T07:00:00")

gap = end - start
print(int(gap.total_seconds() // 60))             # 48
print((end + timedelta(minutes=15)).isoformat())  # 2026-03-14T07:15:00`,
          mistake:
            'A common mistake is `datetime.now()` inside anything that gets checked. The answer changes every second, so the test passes once and then fails forever, and the failure looks like a bug in the arithmetic. Pin the moment instead: parse a fixed stamp, or take it as an argument. The exercise gives you two fixed stamps and never asks the clock.'
        }),
        check(
          'gap-type',
          'You have two datetimes and you evaluate `end - start`. What kind of value is that?',
          [
            { id: 'num', md: 'A number of seconds' },
            { id: 'delta', md: 'A `timedelta`' }
          ],
          'delta',
          {
            explainMd:
              'Subtracting two points in time gives a span, and Python models a span as its own kind of value. Ask it for `.days` or `.total_seconds()` to get a number out; there is no `.minutes`, so whole minutes are `int(gap.total_seconds() // 60)`.'
          }
        ),
        check(
          'now-in-test',
          'A graded task needs "the stamp fifteen minutes later". Which starting point should it use?',
          [
            { id: 'now', md: '`datetime.now()`' },
            { id: 'fixed', md: 'A fixed stamp parsed from text' }
          ],
          'fixed',
          {
            explainMd:
              'Anything built from the current clock produces a different answer on every run, so there is no output a test can be written against. Parsing a fixed stamp makes the run repeatable, and real programs get the same benefit by taking the moment as an argument instead of reading the clock deep inside the work.'
          }
        ),
        pyCode({
          id: 'stamp-math',
          prompt:
            '> `START` and `END` are ISO stamps. Print the whole minutes between them, then the ISO stamp fifteen minutes after `END` — `48 2026-03-14T07:15:00`. Do not call `datetime.now()`.',
          equals: '48 2026-03-14T07:15:00',
          ast: 'fromisoformat',
          hidden: true,
          hints: ladder(
            'The second half of the starter is right by accident. Digit slicing cannot subtract, and it would not roll over the hour if the gap were longer.',
            '`datetime.fromisoformat(START)` and `datetime.fromisoformat(END)` give you two values, and `end - start` gives the span between them.',
            'A span has no `.minutes`, so whole minutes are `int(gap.total_seconds() // 60)`. And `end + timedelta(minutes=15)` is another datetime, which `.isoformat()` prints back as text.',
            `from datetime import datetime, timedelta

START = "2026-03-14T06:12:00"
END = "2026-03-14T07:00:00"

start = datetime.fromisoformat(START)
end = datetime.fromisoformat(END)
gap = end - start

print(int(gap.total_seconds() // 60), (end + timedelta(minutes=15)).isoformat())`
          )
        })
      ]
    }),
    files: {
      'main.py': `START = "2026-03-14T06:12:00"
END = "2026-03-14T07:00:00"

print(int(END[14:16]) - int(START[14:16]), END[:11] + "07:15:00")
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "fromisoformat" in src, "parse the stamp instead of slicing digits out of the string"
assert "timedelta" in src, "a shift in time is a timedelta"
assert ".isoformat()" in src, "print the stamp back out with .isoformat()"
assert "now()" not in src, "a graded task must not read the clock"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'subprocess-idea',
      courseId: 'process',
      moduleId: 'reach',
      title: 'A list, not a sentence',
      skillIds: ['python.modules'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Running another program means handing over a list',
          idea:
            'Running another program means asking the operating system to start it with a list of arguments. `subprocess.run(["python", "report.py", "--station", "ridge"])` hands that list over unchanged: the first item is the program to start, and every other item arrives on the far side as exactly one argument, spaces and punctuation included.',
          bites:
            '`shell=True` is a different request. It hands one string to the system shell and lets the shell decide where each argument begins and ends, so spaces split, quotes disappear, and `;`, `&&`, `|`, and `>` stop being text and become instructions. Build that string out of a note somebody else typed and you have handed them the shell.',
          code: `import subprocess

note = "fox drift; then quiet"
command = ["python", "report.py", "--note", note]

print(len(command), command[-1])      # 4 fox drift; then quiet
subprocess.run(command, check=True)   # the note arrives whole, as one argument

# subprocess.run("python report.py --note " + note, shell=True)
#   the shell would read "; then quiet" as a second command to run`,
          mistake:
            'A common mistake is reaching for `shell=True` to get a wildcard or a pipe and then leaving it there once the arguments start coming from data. Keep the list form and do the joining, globbing, or redirecting in Python. This sandbox cannot start another program at all, so the exercise builds the argument list and inspects it instead of running it.'
        }),
        check(
          'list-vs-shell',
          'A note field contains `fox drift; then quiet`. You build `"python report.py --note " + note` and run it with `shell=True`. What happens?',
          [
            { id: 'onearg', md: 'The whole note is passed as one argument' },
            { id: 'two', md: '`python report.py --note fox drift` runs, and then `then quiet` runs as a second command' }
          ],
          'two',
          {
            explainMd:
              'The shell parses that string before anything starts: spaces separate arguments and `;` separates commands. At that point the note is no longer data, it is syntax — which is the entire shape of a command injection, and the reason the list form exists at all.'
          }
        ),
        check(
          'first-item',
          'In the list form, what is the first item of the list?',
          [
            { id: 'script', md: 'The script to run' },
            { id: 'prog', md: 'The program to start; the script is the next item' }
          ],
          'prog',
          {
            explainMd:
              'The operating system starts a program and hands it the rest of the list as arguments, so `["python", "report.py", "--station", "ridge"]` starts `python` and `report.py` arrives as its first argument. That mirrors `sys.argv` on the other side, where index 0 is the script and real arguments begin at index 1.'
          }
        ),
        pyCode({
          id: 'build-argv',
          prompt:
            '> Write `build_command(station, note)` returning the argument list that would run `python report.py --station <station> --note <note>`. Print how many items it has and whether the note survived as one item — `6 True`.',
          equals: '6 True',
          ast: 'def build_command',
          hidden: true,
          hints: ladder(
            'The starter builds one sentence and the print gives it away: the length is a character count and the last item is a single letter.',
            'Return a list instead: the program, then the script, then each flag and its value as two separate items. Nothing gets quoted and nothing gets joined.',
            'A different command, same shape: `["python", "clean.py", "--in", path]` is four items, and `path` arrives whole even when it contains a space.',
            `def build_command(station, note):
    return ["python", "report.py", "--station", station, "--note", note]


cmd = build_command("ridge", "fox drift; then quiet")

print(len(cmd), cmd[-1] == "fox drift; then quiet")`
          )
        })
      ]
    }),
    files: {
      'main.py': `def build_command(station, note):
    return "python report.py --station " + station + " --note " + note


cmd = build_command("ridge", "fox drift; then quiet")

print(len(cmd), cmd[-1] == "fox drift; then quiet")
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "shell=True" not in src, "the list form is the safe one; do not reach for the shell"

import main

cmd = main.build_command("ridge", "fox drift; then quiet")
assert isinstance(cmd, list), "an argument list is a list of separate items, not one string"
assert cmd[0] == "python", "the program to start comes first"
assert cmd[1] == "report.py", "the script is an argument to that program"
assert cmd[2:4] == ["--station", "ridge"], "a flag and its value are two items"
assert cmd[4] == "--note", "then the note flag"
assert cmd[5] == "fox drift; then quiet", "the note stays one item, spaces and semicolon included"
assert len(cmd) == 6, "six items in all"
`
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-report-tool',
      courseId: 'process',
      moduleId: 'reach',
      title: 'Transfer: one command, start to finish',
      skillIds: ['python.io.files', 'python.io.stdio'],
      estimatedMinutes: 22,
      mastery: { requiresTransfer: true },
      creation: {
        id: 'field-station',
        step: 1,
        briefMd:
          'Step 1 of the field station. A command you can actually run: it takes a station name, reads the records file off disk, and prints one line another program can read. Later steps add tests and the rest of the package.'
      },
      blocks: [
        teach({
          heading: 'The wiring is the new part',
          idea:
            'A reporting command is three things you already have, joined up. The caller names what they want on the command line, the records come off disk in a format that survives a comma inside a field, and the answer goes to `stdout` as one line something else can read. Nothing here is a new idea; the wiring is.',
          bites:
            'Keep the reading and the counting inside a function that takes the path and the station, and keep the command line outside it. That is what lets a test call the function directly with no command line at all, and it is what makes a station with nothing logged return zeros instead of raising — because "nothing logged" is an answer, not a failure.',
          code: `import csv
import sys


def loudest(path):
    best = ("", -1)
    with open(path, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if int(row["drift"]) > best[1]:
                best = (row["station"], int(row["drift"]))
    return best


station, drift = loudest("records.csv")
print(station, drift, len(sys.argv) - 1)`,
          mistake:
            'A common mistake is reading `sys.argv` inside the function, which makes it answerable only from a command line and moves the missing-argument crash into the middle of the work. Take the station as a parameter. The hidden test calls your function with stations you were not shown, including one that never appears in the file.'
        }),
        check(
          'argv-in-function',
          'Where should `sys.argv[1]` be read in a small reporting tool?',
          [
            { id: 'inside', md: 'Inside the function that does the work, so it always has a station' },
            { id: 'outside', md: 'Outside it, and passed in as a parameter' }
          ],
          'outside',
          {
            explainMd:
              'A function that reads the command line can only answer one question, and only when a command line exists. Passing the station in makes the same function usable from a test, from a loop over every station, and from another tool — and it moves the missing-argument error out to where the caller can explain it.'
          }
        ),
        check(
          'missing-station',
          'Your `summarise(path, station)` is asked about a station that appears nowhere in the file. What should it return?',
          [
            { id: 'boom', md: 'It should raise, so the caller knows' },
            { id: 'zero', md: '`(0, 0)` — no rows, so no readings' }
          ],
          'zero',
          {
            explainMd:
              'Zero rows is a real answer rather than an error: a station with nothing logged today has a count of zero and a total of zero. Raising forces every caller to wrap the call in a `try`, and it erases the difference between "nothing was logged" and "I could not read the file at all".'
          }
        ),
        pyCode({
          id: 'report-tool',
          prompt:
            '> Finish `summarise(path, station)` so it returns `(count, total)` for the rows of `records.csv` whose `station` matches, then print the station from `sys.argv[1]`, the count, and the total — `ridge 2 5`.',
          equals: 'ridge 2 5',
          ast: 'sys.argv[1]',
          fixtures: ['records.csv'],
          hidden: true,
          hints: ladder(
            'The function is a stub that answers zero for everything. All it needs is already in its two parameters: the path and the station name.',
            'Open the path with `newline=""`, walk `csv.DictReader(f)`, skip the rows whose `station` does not match, and count and total the rest. `row["drift"]` is text, so `int(...)` it.',
            'Outside the function the station comes from the command line. On another file you would write `count, total = summarise("march.csv", sys.argv[1])` and print the three values on one line.',
            `import csv
import sys


def summarise(path, station):
    count = 0
    total = 0
    with open(path, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if row["station"] != station:
                continue
            count += 1
            total += int(row["drift"])
    return count, total


station = sys.argv[1]
count, total = summarise("records.csv", station)

print(station, count, total)`
          ),
          argv: ['ridge']
        })
      ]
    }),
    files: {
      'records.csv': `station,note,drift
ridge,"fox, then owl",2
north,quiet,0
creek,"ping, ping",5
ridge,drift again,3`,
      'main.py': `import csv
import sys


def summarise(path, station):
    return (0, 0)


count, total = summarise("records.csv", "ridge")

print("ridge", count, total)
`,
      'hidden_test.py': `from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "sys.argv[1]" in src, "the station comes from the command line"
assert "DictReader" in src, "a note field holds a comma, so let csv.DictReader split the row"

import main

assert main.summarise("records.csv", "creek") == (1, 5), "creek has one row, drift 5"
assert main.summarise("records.csv", "north") == (1, 0), "north has one row, drift 0"
assert main.summarise("records.csv", "hollow") == (0, 0), "a station with no rows is (0, 0)"
`
    }
  })

  return out
}
