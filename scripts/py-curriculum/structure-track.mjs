import { lesson, teach, predict, check, cloze, tf, ladder, pyCode, importAssert, srcIncludes } from './lib.mjs'

/** Read-only companion module for the first two import lessons. */
const STATION_MODULE = `NAME = "Ridge"
SENSORS = ["soil", "wind", "temp"]


def label():
    return NAME + " station"
`

const STATION_CONVERT = `NAME = "Ridge"


def celsius(fahrenheit):
    return round((fahrenheit - 32) * 5 / 9, 1)


def wind_label(kph):
    return "calm" if kph < 12 else "breezy"
`

/** The `station/` package the learner imports in `packages-and-init`. */
const PACKAGE_FILES = [
  {
    path: 'files/station/__init__.py',
    role: 'ro',
    contents: `NAME = "Ridge"

from station.report import line
`
  },
  {
    path: 'files/station/report.py',
    role: 'ro',
    contents: `from .sensors import value


def line(name):
    return f"{name}={value(name)}"
`
  },
  {
    path: 'files/station/sensors.py',
    role: 'ro',
    contents: `READINGS = {"temp": 4, "wind": 18, "soil": 11}


def value(name):
    return READINGS[name]
`
  }
]

export function lessonsStructure() {
  const out = []

  out.push({
    doc: lesson({
      id: 'module-is-a-file',
      courseId: 'modules',
      moduleId: 'files-as-modules',
      title: 'A file is a module',
      skillIds: ['python.modules'],
      estimatedMinutes: 15,
      blocks: [
        teach({
          heading: 'Importing binds a namespace',
          idea:
            'Every `.py` file on the import path is already a module — you do not declare one. When another file runs `import station`, Python finds `station.py`, runs it once from top to bottom, and binds the single name `station` to a module object holding everything that file defined at its top level.',
          bites:
            'The word "import" makes people picture the text of the other file being pasted in where the import sits. It is not. Nothing from `station.py` lands in your namespace except the one name `station`, so `label()` on its own is still an undefined name and only `station.label()` reaches the function.',
          code: `# station.py holds NAME = "Ridge" and def label(): ...
import station

print(type(station).__name__)   # module — one object, not pasted text
print(station.NAME)             # Ridge — reach through the module
print(station.label())          # Ridge station`,
          mistake:
            'A common mistake is typing the answer the module would have produced instead of asking the module for it, which looks identical on screen and breaks the moment the module changes. The exercise ships a read-only `station.py` next to your file: import it and print `station.label()` rather than the words it happens to return today.'
        }),
        predict(
          'what-import-binds',
          'After `import station`, what does the name `station` hold?',
          [
            { id: 'text', md: 'A copy of the text of `station.py`, spliced in where the import sits' },
            { id: 'module', md: 'A module object whose attributes are the top-level names in `station.py`' }
          ],
          'module',
          {
            explainMd:
              'Python runs the file once and wraps the names it defined in a module object, then binds that one object to `station`. That is why you reach attributes through a dot: the names live on the module, not in your file.'
          }
        ),
        tf(
          'no-bare-name',
          'After `import station`, you can call `label()` with no prefix because the import brought the function in.',
          false,
          {
            explainMd:
              'Only the name `station` was bound. `label` still lives as an attribute of that module object, so `label()` on its own raises `NameError` while `station.label()` works. The `from` form is what binds a bare name, and that comes next.'
          }
        ),
        pyCode({
          id: 'reach-through-module',
          prompt:
            '> `station.py` sits next to your file, read-only. Import it and print `station.label()`. Output should be `Ridge station`.',
          equals: 'Ridge station',
          roFiles: ['station.py'],
          hidden: true,
          hints: ladder(
            'The starter types the words that `station.py` would have produced. Nothing asks the module anything.',
            'Bind the module first with `import station`, then reach a top-level name through the dot: `station.label()`.',
            'The same shape works for data as well as functions — after `import station`, `station.SENSORS` is that file\u2019s list.',
            'import station\n\nprint(station.label())'
          )
        })
      ]
    }),
    files: {
      'main.py': `print("Ridge station")
`,
      'station.py': STATION_MODULE,
      'hidden_test.py': srcIncludes('import station', 'station.label()')
    }
  })

  out.push({
    doc: lesson({
      id: 'import-forms',
      courseId: 'modules',
      moduleId: 'files-as-modules',
      title: 'Four ways to spell an import',
      skillIds: ['python.modules'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Pick what lands in your namespace',
          idea:
            '`import station` binds the module and leaves everything behind a dot. `from station import celsius` binds the function itself, so you call `celsius(212)` with no prefix. `import station as st` and `from station import celsius as to_c` do the same two jobs while letting you choose a shorter local name.',
          bites:
            'The choice matters because a reader has to work out where a name came from. `station.celsius(212)` says exactly which file owns that function; a bare `celsius(212)` needs the reader to scroll up to the imports. `from station import *` removes even that: it dumps every public name in at once, so a name collision silently shadows whichever import ran first.',
          code: `import station as st
from station import celsius, wind_label as gust

print(st.NAME)          # Ridge — module still available behind the alias
print(celsius(212))     # 100.0 — bare name, bound by the from form
print(gust(30))         # breezy — same function, renamed locally`,
          mistake:
            'A common mistake is reaching for `from station import *` because it saves typing, then spending an afternoon hunting the file a mystery name came from. The exercise asks for both forms deliberately: alias the module as `st` and pull `celsius` in by name, so you can feel the difference in one file.'
        }),
        check(
          'star-import-cost',
          'What does `from station import *` cost you?',
          [
            { id: 'origin', md: 'You can no longer tell, at the call site, which module a name came from' },
            { id: 'slower', md: 'It makes the program measurably slower to start' },
            { id: 'nothing', md: 'Nothing — it is the same as listing every name by hand' }
          ],
          'origin',
          {
            explainMd:
              'A star import binds every public name at once, so a reader looking at `celsius(212)` has no clue whether it came from `station`, from another star import, or from this file. It also lets a later import silently shadow an earlier one, which is a bug that leaves no trace at the call site.'
          }
        ),
        cloze(
          'what-each-binds',
          '`from station import celsius` binds the name {{a}}. `import station as st` binds the name {{b}}.',
          [
            { id: 'a', choices: ['celsius', 'station', 'st'] },
            { id: 'b', choices: ['st', 'station', 'celsius'] }
          ],
          { a: 'celsius', b: 'st' },
          {
            explainMd:
              'The `from` form reaches inside the module and binds the member itself, so `celsius` becomes a local name. The `as` form binds the whole module object under the label you chose, so `station` is not defined at all — only `st` is.'
          }
        ),
        pyCode({
          id: 'both-forms',
          prompt:
            '> `station.py` is read-only next door. Alias the module as `st` **and** pull `celsius` in by name. Print `celsius(212)` and `st.NAME` on one line, separated by a space. Output should be `100.0 Ridge`.',
          equals: '100.0 Ridge',
          roFiles: ['station.py'],
          hidden: true,
          hints: ladder(
            'The starter uses one form for both jobs. This lesson wants each form used once, in the same file.',
            '`import station as st` binds the module under a short name; `from station import celsius` binds the function itself.',
            'Two imports of the same module are cheap — the file is only executed once, no matter how many forms name it.',
            'import station as st\nfrom station import celsius\n\nprint(celsius(212), st.NAME)'
          )
        })
      ]
    }),
    files: {
      'main.py': `import station

print(station.celsius(212), station.NAME)
`,
      'station.py': STATION_CONVERT,
      'hidden_test.py': srcIncludes('import station as st', 'from station import celsius')
    }
  })

  out.push({
    doc: lesson({
      id: 'main-guard',
      courseId: 'modules',
      moduleId: 'files-as-modules',
      title: 'A tool and a library at once',
      skillIds: ['python.modules'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Import runs the file',
          idea:
            'Importing a module executes every top-level statement in it, once, the first time anybody imports it. Definitions, assignments, and loose `print` calls all run. Python records which way the file was entered in the name `__name__`: it is the string `"__main__"` when you ran the file directly, and the module\u2019s own name when somebody imported it.',
          bites:
            'That is why an unguarded script becomes a bad library. Import it for the one function you wanted and its whole demo fires — output you did not ask for, a file rewritten, a long computation. Wrapping the script part in `if __name__ == "__main__":` keeps the definitions importable while the demo only runs on a direct run.',
          code: `NAME = "Ridge"


def report():
    return NAME + " ok"


if __name__ == "__main__":
    print(report())   # direct run: prints. Imported: stays quiet.`,
          mistake:
            'A common mistake is believing that an import only "makes names available" and does not run anything, so top-level side effects feel safe. They are not. The exercise asks you to write `report()` and print it **only** under the guard, so importing your file produces no output at all.'
        }),
        predict(
          'import-runs-top-level',
          '`station.py` has `print("loaded")` sitting at its top level. Another file runs `import station`. What happens?',
          [
            {
              id: 'silent',
              md: 'Nothing prints — an import only makes names available',
              misconceptionId: 'import-runs-nothing'
            },
            { id: 'prints', md: '`loaded` prints — the import executes the file top to bottom' }
          ],
          'prints',
          {
            explainMd:
              'There is no separate "declaration" pass in Python. Import means run the file once and keep the names it produced, so a top-level `print` prints, a top-level loop loops, and a top-level file write writes. The guard exists precisely because import is execution.'
          }
        ),
        tf(
          'guard-keeps-quiet',
          'With the print moved inside `if __name__ == "__main__":`, importing the module produces no output.',
          true,
          {
            explainMd:
              'On an import, `__name__` holds the module name — `"station"`, not `"__main__"` — so the guarded branch is skipped and only the definitions above it take effect. Run the same file directly and `__name__` is `"__main__"`, so the branch fires.'
          }
        ),
        pyCode({
          id: 'guard-the-script',
          prompt:
            '> Write `report()` so it returns `Ridge ok`, then print it **only** when this file is run as a script. Running it should print `Ridge ok`; importing it should print nothing.',
          equals: 'Ridge ok',
          hidden: true,
          hints: ladder(
            'The starter prints at the top level, so anybody who imports it gets that line whether they wanted it or not.',
            'Compare `__name__` to the string `"__main__"` and put the print inside that `if`. Leave the `def` outside it.',
            'The same shape guards anything: `if __name__ == "__main__": main()` runs a whole command only on a direct run.',
            'NAME = "Ridge"\n\n\ndef report():\n    return NAME + " ok"\n\n\nif __name__ == "__main__":\n    print(report())'
          )
        })
      ]
    }),
    files: {
      'main.py': `NAME = "Ridge"


def report():
    return NAME + " ok"


print(report())
`,
      'hidden_test.py': importAssert(`from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "__name__" in src, "guard the script part with if __name__ == ...:"
assert "__main__" in src, "compare __name__ against the string __main__"
assert main.report() == "Ridge ok", "report() should return 'Ridge ok'"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'packages-and-init',
      courseId: 'modules',
      moduleId: 'bigger',
      title: 'A folder full of modules',
      skillIds: ['python.modules'],
      estimatedMinutes: 18,
      blocks: [
        teach({
          heading: 'A package is a directory with a front door',
          idea:
            'When one file stops being enough you put the modules in a directory and add `__init__.py`. That file marks the directory as a regular package and runs the first time anybody imports it, so `import station` executes `station/__init__.py` and `station.report` executes `station/report.py`. The `__init__.py` is the package\u2019s front door: what it re-exports is what callers see first.',
          bites:
            'Keep the front door thin. A little `NAME = "Ridge"` and a few `from station.report import line` lines are fine; real work in `__init__.py` runs on every import of anything in the package. Inside the package, `from .sensors import value` is a **relative** import — the dot means "this package" — while `from station.sensors import value` spells the same target **absolutely**, which is what callers outside must use.',
          code: `# station/__init__.py
#     NAME = "Ridge"
#     from station.report import line
# station/report.py
#     from .sensors import value   <- relative: the dot is this package
from station import line

print(line("wind"))     # wind=18 — reached through the front door`,
          mistake:
            'A common mistake is drilling straight into the deepest module — `import station.sensors` then `station.sensors.value("wind")` — and rebuilding by hand what the package already offers. The exercise ships a read-only `station/` package whose `__init__.py` re-exports `line`; import `line` from the package and print `line("wind")`.'
        }),
        check(
          'what-init-does',
          'What does adding `__init__.py` to a directory do?',
          [
            {
              id: 'marks',
              md: 'Marks it as a regular package and runs when the package is first imported'
            },
            { id: 'lists', md: 'Lists which files in the directory are allowed to be imported' },
            { id: 'required', md: 'Is required in every subdirectory of a project, package or not' }
          ],
          'marks',
          {
            explainMd:
              'The file does two jobs at once: it tells Python this directory is a regular package, and its body executes on first import, which is where a thin set of re-exports belongs. It never lists or restricts the other modules — those stay importable as `station.report` whether or not the front door mentions them.'
          }
        ),
        cloze(
          'relative-vs-absolute',
          '`from .sensors import value` is a {{a}} import. `from station.sensors import value` is an {{b}} import.',
          [
            { id: 'a', choices: ['relative', 'absolute', 'star'] },
            { id: 'b', choices: ['absolute', 'relative', 'star'] }
          ],
          { a: 'relative', b: 'absolute' },
          {
            explainMd:
              'The leading dot means "the package this module already lives in", so a relative import survives renaming the package. An absolute import names the path from the top of the import path down, which is the only form that works from outside the package.'
          }
        ),
        pyCode({
          id: 'through-the-front-door',
          prompt:
            '> The read-only `station/` package re-exports `line` from its `__init__.py`. Import `line` from the package and print `line("wind")`. Output should be `wind=18`.',
          equals: 'wind=18',
          extraFiles: PACKAGE_FILES,
          hidden: true,
          hints: ladder(
            'The starter reaches past the front door into `station.sensors` and glues the label together itself.',
            'The package already re-exports the function you want, so `from station import line` is enough.',
            'The same idea outside Python: you ring the doorbell rather than climbing through a back window you happen to know about.',
            'from station import line\n\nprint(line("wind"))'
          )
        })
      ]
    }),
    files: {
      'main.py': `import station.sensors

print("wind=" + str(station.sensors.value("wind")))
`,
      'hidden_test.py': srcIncludes('from station import line', 'line("wind")')
    }
  })

  out.push({
    doc: lesson({
      id: 'stdlib-tour',
      courseId: 'modules',
      moduleId: 'bigger',
      title: 'Look in the standard library first',
      skillIds: ['python.modules'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Eight modules worth knowing by name',
          idea:
            'Python ships a large standard library, already installed, with no dependency to declare. Eight of them cover most field-station work: `collections` for containers the built-ins lack, `itertools` for combining and chunking streams, `datetime` for stamps and durations, `pathlib` for paths, `json` for records that travel, `re` for patterns in text, `math` for real arithmetic, and `random` for picks and shuffles.',
          bites:
            'The habit worth building is to ask "does the library already do this?" before writing a loop. Hand-rolled counting, date parsing, and path gluing are where most small-script bugs live, and every one of them has a tested answer a single import away. `random` is the one to handle carefully: seed it with `random.seed(7)` whenever a result has to be repeatable, or the same code gives a different answer every run.',
          code: `import random
from collections import Counter
from math import sqrt

random.seed(7)
print(random.choice(["soil", "wind", "temp"]))   # same pick every run, because of the seed
print(Counter("aabbbc").most_common(1))          # [('b', 3)]
print(round(sqrt(2), 3))                         # 1.414`,
          mistake:
            'A common mistake is reaching for a third-party package for something already in the box, which adds an install step and a version to keep up with for no gain. The exercise counts repeated sensor tags: use `collections.Counter` rather than building the tally dictionary by hand.'
        }),
        check(
          'reach-first',
          'You need the tag that appears most often in a list. What is the first move?',
          [
            { id: 'stdlib', md: 'Check the standard library — `collections.Counter` already tallies and ranks' },
            { id: 'byhand', md: 'Write the tally loop first, then look for a library if it turns out slow' },
            { id: 'install', md: 'Add a counting package to `requirements.txt`' }
          ],
          'stdlib',
          {
            explainMd:
              'A tally loop is not wrong, and writing one once is good practice — but the library version is already tested, already handles ties in a defined order, and reads in one line. Looking first costs seconds and often removes the whole block of code you were about to write.'
          }
        ),
        cloze(
          'which-module',
          'Records that travel between programs: {{a}}. File and folder paths: {{b}}. A pattern inside a line of text: {{c}}.',
          [
            { id: 'a', choices: ['json', 'datetime', 'math'] },
            { id: 'b', choices: ['pathlib', 're', 'random'] },
            { id: 'c', choices: ['re', 'itertools', 'collections'] }
          ],
          { a: 'json', b: 'pathlib', c: 're' },
          {
            explainMd:
              'These three come up constantly: `json` turns records into text and back, `pathlib` gives you path objects that join and split correctly on every platform, and `re` searches and rewrites by pattern. Naming the right module is most of the work; the API is a docs lookup away.'
          }
        ),
        tf(
          'seed-for-repeatable',
          '`random.seed(7)` before the picks is what makes a graded exercise using `random` repeatable.',
          true,
          {
            explainMd:
              'A fixed seed puts the generator in a known state, so the same sequence of calls yields the same values on every run and on every machine. Without it a check that compares output passes and fails at random, which teaches the learner nothing.'
          }
        ),
        pyCode({
          id: 'top-tag',
          prompt:
            '> Finish `top_tag(tags)` so it returns the most common tag as `tag=count` — for `["wind", "wind", "soil"]` that is `wind=2`. Use `collections.Counter`. Printing `top_tag(TAGS)` should give `soil=3`.',
          equals: 'soil=3',
          ast: 'Counter',
          hidden: true,
          hints: ladder(
            'The starter hands back a fixed string, so the list it was given never changes the answer.',
            '`Counter(tags).most_common(1)` gives a one-item list of `(tag, count)` pairs — unpack the first pair and format it.',
            'On `"aabbbc"`, `Counter(...).most_common(1)` is `[("b", 3)]`, so `pair[0]` is the tag and `pair[1]` is the count.',
            'from collections import Counter\n\nTAGS = ["soil", "wind", "soil", "temp", "soil", "wind"]\n\n\ndef top_tag(tags):\n    tag, count = Counter(tags).most_common(1)[0]\n    return f"{tag}={count}"\n\n\nprint(top_tag(TAGS))'
          )
        })
      ]
    }),
    files: {
      'main.py': `TAGS = ["soil", "wind", "soil", "temp", "soil", "wind"]


def top_tag(tags):
    return "soil=1"


print(top_tag(TAGS))
`,
      'hidden_test.py': importAssert(`assert main.top_tag(["wind", "wind", "soil"]) == "wind=2"
assert main.top_tag(["temp"]) == "temp=1"
assert main.top_tag(["a", "b", "b", "b", "a"]) == "b=3"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'venv-and-dependencies',
      courseId: 'modules',
      moduleId: 'bigger',
      title: 'Where a project keeps its packages',
      skillIds: ['python.modules'],
      estimatedMinutes: 12,
      blocks: [
        teach({
          heading: 'One environment per project',
          idea:
            'A virtual environment is nothing clever: it is a folder holding its own Python interpreter and its own `site-packages`. Activate it and `import` searches that folder instead of the machine-wide one, so what this project installed is invisible to every other project. Deleting the folder undoes every install in it.',
          bites:
            'Installing everything globally works right up until two projects disagree. The log tool needs version 1 of a library, the report tool needs version 3, and one machine can only hold one global copy — so upgrading for one project silently breaks the other, usually weeks later. `requirements.txt` and the `dependencies` table in `pyproject.toml` do not contain the packages; they *declare* which ones this project needs, so anyone can rebuild the same environment from scratch.',
          code: `python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python -m pip list`,
          lang: 'text',
          mistake:
            'A common mistake is treating `requirements.txt` as documentation nobody has to keep current, then handing over a project that only runs on the machine it was written on. This lesson has no exercise to run — the sandbox has no network and no `pip` — so the questions are where you check the idea.'
        }),
        check(
          'what-a-venv-is',
          'Concretely, what is a virtual environment?',
          [
            {
              id: 'folder',
              md: 'A folder with its own interpreter and its own installed packages, used only by this project'
            },
            { id: 'setting', md: 'A setting inside Python that hides packages you are not currently using' },
            { id: 'copy', md: 'A copy of your source code kept separate from the original' }
          ],
          'folder',
          {
            explainMd:
              'It is a directory on disk, and that is the whole trick: activating it puts that directory\u2019s interpreter and `site-packages` first, so installs land there and imports resolve there. Nothing is hidden and your source code is not copied — you can delete the folder and rebuild it from the declared dependencies.'
          }
        ),
        check(
          'what-requirements-declares',
          '`requirements.txt` and the `dependencies` list in `pyproject.toml` both do what?',
          [
            {
              id: 'declare',
              md: 'Declare which packages the project needs, so someone else can rebuild the same environment'
            },
            { id: 'contain', md: 'Contain the packages themselves, so the project runs with nothing installed' },
            { id: 'order', md: 'Tell Python which of your own modules to import first' }
          ],
          'declare',
          {
            explainMd:
              'They are a shopping list, not the groceries. The install step still has to run, which is why the file lives in version control while the environment folder does not — the declaration is the part worth sharing, and it is what makes a project reproducible on a new machine.'
          }
        ),
        tf(
          'global-installs-collide',
          'If every project installs into the machine-wide Python, two projects cannot depend on different versions of the same library.',
          true,
          {
            explainMd:
              'There is one global `site-packages`, so a library can only be present at one version at a time. Upgrading for the project you are working on quietly changes the library under every other project on that machine, and the breakage shows up whenever you next run one of them.'
          }
        ),
        cloze(
          'env-vocabulary',
          'The folder with the project\u2019s own interpreter and packages is the {{a}}. The file that names what the project depends on is the {{b}}.',
          [
            { id: 'a', choices: ['virtual environment', 'standard library', 'package'] },
            { id: 'b', choices: ['requirements.txt', '__init__.py', 'main.py'] }
          ],
          { a: 'virtual environment', b: 'requirements.txt' },
          {
            explainMd:
              'Keep the two ideas apart: the environment is the installed state on this machine, and the requirements file is the declaration you commit. `__init__.py` is unrelated — that marks a directory as a package inside your own code.'
          }
        )
      ]
    }),
    files: {}
  })

  out.push({
    doc: lesson({
      id: 'class-and-instance',
      courseId: 'objects',
      moduleId: 'shape',
      title: 'A template and the things made from it',
      skillIds: ['python.objects'],
      estimatedMinutes: 14,
      blocks: [
        teach({
          heading: 'The class is the cutter, the instance is the biscuit',
          idea:
            'A `class` statement describes a kind of thing: what its instances will be called, what they will know, and what they will do. It is a template, and on its own it holds no station readings. Calling the class — `Sensor()` — builds one instance from that template and hands it back.',
          bites:
            'The two get confused because the class name appears in both places. `Sensor` is the template; `Sensor()` is a new object. Every call builds a fresh one, so two calls give you two objects that are equal-looking but separate — `first is second` is `False`, and attributes set on one are invisible to the other.',
          code: `class Sensor:
    pass


a = Sensor()
b = Sensor()
print(type(a).__name__)   # Sensor — the class this instance came from
print(a is b)             # False — two calls, two objects`,
          mistake:
            'A common mistake is building one instance and binding a second name to it, which looks like two sensors until you change one and both change. The exercise wants two genuinely separate instances: print the class name of the first and whether the two names point at the same object, so the answer has to be `Sensor False`.'
        }),
        predict(
          'two-calls-two-objects',
          '`class Sensor: pass`, then `a = Sensor()` and `b = Sensor()`. Is `a is b` true?',
          [
            { id: 'yes', md: 'Yes — they came from the same class, so they are the same object' },
            { id: 'no', md: 'No — each call built a separate object' }
          ],
          'no',
          {
            explainMd:
              'Calling a class runs the construction machinery and hands back a brand-new object every time, so `a` and `b` are two distinct instances of one class. `is` asks about object identity, and identity is per instance — the shared class does not make them shared.'
          }
        ),
        check(
          'what-the-class-holds',
          'What does the class itself hold?',
          [
            { id: 'template', md: 'The template — the names and behaviour every instance will have' },
            { id: 'state', md: 'The state of the one object you built from it' },
            { id: 'copy', md: 'A copy of each instance, so it can list them later' }
          ],
          'template',
          {
            explainMd:
              'The class is a description; the per-thing values live on the instances. Python does not keep a registry of the objects you built, so if you need to know about all your sensors, something in your own code has to collect them in a list.'
          }
        ),
        pyCode({
          id: 'two-sensors',
          prompt:
            '> Build **two separate** `Sensor` instances, `first` and `second`. Print `type(first).__name__` and whether the two names point at the same object, separated by a space. Output should be `Sensor False`.',
          equals: 'Sensor False',
          hidden: true,
          hints: ladder(
            'Look at how `second` is bound in the starter. Is a second object ever built?',
            'Each `Sensor()` call builds one instance, so two separate instances need the class called twice.',
            'Compare with lists: `b = a` gives one list under two names, while `b = list(a)` gives a genuinely second list.',
            'class Sensor:\n    pass\n\n\nfirst = Sensor()\nsecond = Sensor()\n\nprint(type(first).__name__, first is second)'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    pass


first = Sensor()
second = first

print(type(first).__name__, first is second)
`,
      'hidden_test.py': importAssert(`assert type(main.first).__name__ == "Sensor"
assert type(main.second).__name__ == "Sensor"
assert main.first is not main.second, "first and second should be two separate instances"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'init-and-attributes',
      courseId: 'objects',
      moduleId: 'shape',
      title: 'What the instance knows',
      skillIds: ['python.objects'],
      estimatedMinutes: 15,
      blocks: [
        teach({
          heading: '__init__ runs while the object is being built',
          idea:
            'A template is only useful if each thing made from it can differ. `__init__` is the method Python calls for you the moment `Sensor("soil", 11)` runs, with the new object as its first argument and your arguments after it. Whatever you assign onto that object inside `__init__` becomes an attribute the rest of the program can read.',
          bites:
            'The line that matters is `self.name = name`. The bare `name` is only a parameter — a local name that vanishes when `__init__` returns — while `self.name` writes the value onto the instance, where it survives. Miss the `self.` and the value is quietly thrown away, and the attribute error shows up much later at the first read.',
          code: `class Sensor:
    def __init__(self, name, unit):
        self.name = name      # onto the instance: survives
        self.unit = unit
        note = name.upper()   # local only: gone at return
        del note


wind = Sensor("wind", "kph")
print(wind.name, wind.unit)   # wind kph`,
          mistake:
            'A common mistake is writing an `__init__` that takes no arguments and hard-codes the values, which builds one sensor beautifully and every other sensor wrong. The exercise asks for an `__init__(self, name, reading)` that stores both, so `Sensor("soil", 11)` and `Sensor("wind", 18)` are both possible.'
        }),
        predict(
          'when-init-runs',
          'When does `__init__` run?',
          [
            { id: 'construct', md: 'When you call the class, before the new object comes back to you' },
            { id: 'first-read', md: 'The first time you read an attribute off the instance' },
            { id: 'manual', md: 'Only if you call `obj.__init__()` yourself' }
          ],
          'construct',
          {
            explainMd:
              'Calling `Sensor("soil", 11)` builds a bare object, hands it to `__init__` as `self`, and only then returns it, so by the time the name is bound the attributes already exist. That is why you never call `__init__` by hand — the construction call has already done it.'
          }
        ),
        cloze(
          'self-dot-matters',
          '`self.name = name` stores the value on the {{a}}. The bare `name` on the right is just a {{b}}.',
          [
            { id: 'a', choices: ['instance', 'class', 'module'] },
            { id: 'b', choices: ['parameter', 'attribute', 'method'] }
          ],
          { a: 'instance', b: 'parameter' },
          {
            explainMd:
              'The left side reaches through `self` and writes onto the object being built, which is why the value outlives the call. The right side is an ordinary parameter in the method\u2019s local scope and disappears the moment `__init__` returns.'
          }
        ),
        pyCode({
          id: 'store-two-attrs',
          prompt:
            '> Give `Sensor` an `__init__` that takes `name` and `reading` and stores both on the instance. Build `Sensor("soil", 11)` as `probe`, then print `probe.name` and `probe.reading` separated by a space. Output should be `soil 11`.',
          equals: 'soil 11',
          hidden: true,
          hints: ladder(
            'The starter\u2019s `__init__` accepts nothing, so the values are baked into the class rather than passed in.',
            'Add the parameters to `__init__` and assign each one through `self` so it lands on the instance.',
            'A second example: `def __init__(self, cols, rows): self.cols = cols; self.rows = rows` lets one class make grids of any size.',
            'class Sensor:\n    def __init__(self, name, reading):\n        self.name = name\n        self.reading = reading\n\n\nprobe = Sensor("soil", 11)\n\nprint(probe.name, probe.reading)'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    def __init__(self):
        self.name = "soil"
        self.reading = 11


probe = Sensor()

print(probe.name, probe.reading)
`,
      'hidden_test.py': importAssert(`gust = main.Sensor("wind", 18)
assert gust.name == "wind"
assert gust.reading == 18
soil = main.Sensor("soil", 11)
assert soil.name == "soil" and soil.reading == 11
assert gust.name == "wind", "each instance keeps its own attributes"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'methods-and-self',
      courseId: 'objects',
      moduleId: 'shape',
      title: 'self is just the first parameter',
      skillIds: ['python.objects'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'The instance is passed in for you',
          idea:
            'A method is a function defined inside a class body whose first parameter receives the instance. `self` is the conventional name for that parameter, nothing more — you could call it `probe` and the code would still work. What makes methods feel magical is only that `probe.label()` fills the first argument in for you.',
          bites:
            'Once you see the two spellings side by side the magic drops away: `probe.label()` and `Sensor.label(probe)` reach the same code with the same object. That is also why every method needs the parameter written out, and why reading `self.name` inside a method is the only way to get at *this* sensor\u2019s name rather than some other one.',
          code: `class Sensor:
    def __init__(self, name):
        self.name = name

    def label(self):
        return "sensor:" + self.name


wind = Sensor("wind")
print(wind.label())          # sensor:wind
print(Sensor.label(wind))    # sensor:wind — the same call, spelled out`,
          mistake:
            'A common mistake is writing a method that ignores `self` and returns a fixed string, which passes the one example in front of you and fails every other instance. The exercise asks for `label(self)` built from `self.name`, so `Sensor("wind").label()` has to come out as `sensor:wind` without you naming wind anywhere.'
        }),
        predict(
          'what-is-self',
          'In `def label(self):`, what is `self`?',
          [
            {
              id: 'keyword',
              md: 'A Python keyword the interpreter reserves for methods',
              misconceptionId: 'self-is-a-keyword'
            },
            { id: 'param', md: 'An ordinary first parameter; the instance is passed into it for you' }
          ],
          'param',
          {
            explainMd:
              '`self` is not in Python\u2019s keyword list — it is a naming convention everyone follows so code reads the same way everywhere. The real mechanism is the attribute lookup: `probe.label` bundles the instance with the function, then the call passes it as the first argument.'
          }
        ),
        tf(
          'two-spellings',
          '`probe.label()` and `Sensor.label(probe)` reach the same code with the same instance.',
          true,
          {
            explainMd:
              'They are the same call written two ways. The dotted form looks up `label` on the class, binds `probe` to the first parameter, and calls it, which is exactly what the explicit form does by hand — handy to remember when a traceback shows an unexpected argument count.'
          }
        ),
        pyCode({
          id: 'label-from-self',
          prompt:
            '> Make `label(self)` return `"sensor:"` followed by **this** sensor\u2019s name, so `Sensor("wind").label()` is `sensor:wind`. Printing `probe.label()` should give `sensor:soil`.',
          equals: 'sensor:soil',
          hidden: true,
          hints: ladder(
            'The starter\u2019s `label` returns the same text no matter which sensor calls it.',
            'Inside a method, the instance arrives as the first parameter, so `self.name` is this sensor\u2019s own name.',
            'A different example: `def area(self): return self.cols * self.rows` reads two attributes off whichever grid called it.',
            'class Sensor:\n    def __init__(self, name):\n        self.name = name\n\n    def label(self):\n        return "sensor:" + self.name\n\n\nprobe = Sensor("soil")\n\nprint(probe.label())'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    def __init__(self, name):
        self.name = name

    def label(self):
        return "sensor:soil"


probe = Sensor("soil")

print(probe.label())
`,
      'hidden_test.py': importAssert(`assert main.Sensor("wind").label() == "sensor:wind"
assert main.Sensor("temp").label() == "sensor:temp"
assert main.Sensor.label(main.Sensor("soil")) == "sensor:soil"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'class-vs-instance-attr',
      courseId: 'objects',
      moduleId: 'shape',
      title: 'Shared by the class, or owned by the thing',
      skillIds: ['python.objects'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'One copy on the class, one copy per instance',
          idea:
            'An assignment in the class body makes a **class** attribute: one object, looked up through every instance. An assignment through `self` in `__init__` makes an **instance** attribute: a fresh one per object. Reading `probe.UNIT` checks the instance first and then falls back to the class, which is why both spellings appear to work.',
          bites:
            'For a constant like `UNIT = "kph"` the sharing is exactly what you want. For a list or a dict it is a trap: `seen = []` in the class body builds **one** list when the class is defined, so appending through any instance is visible through all of them, and a "fresh" sensor arrives already holding another sensor\u2019s readings. Note that `a.seen = []` is different again — assignment creates an instance attribute that shadows the class one.',
          code: `class Sensor:
    seen = []          # one list, built once, shared


a = Sensor()
b = Sensor()
a.seen.append(18)
print(b.seen)          # [18] — b never appended anything
print(Sensor.seen)     # [18] — it was always the class's list`,
          mistake:
            'A common mistake is reading `seen = []` as "every sensor starts with an empty list", because that is what it looks like. The exercise keeps `UNIT` shared on purpose and asks you to move `seen` so each instance owns its own — after `a.seen.append(18)`, `len(b.seen)` must be `0`.'
        }),
        predict(
          'shared-list',
          '`class Sensor: seen = []`. After `a.seen.append("wind")`, what is `b.seen`?',
          [
            {
              id: 'empty',
              md: '`[]` — each instance got its own list',
              misconceptionId: 'class-attr-is-per-instance'
            },
            { id: 'shared', md: '`["wind"]` — one list on the class, reached through both names' }
          ],
          'shared',
          {
            explainMd:
              'The list object was built once, when the `class` statement ran, and never again. Neither instance has a `seen` of its own, so both lookups fall back to the class and land on the same list — appending through one name is appending through all of them.'
          }
        ),
        tf(
          'assign-shadows',
          '`a.seen = []` creates an instance attribute on `a` that shadows the class attribute.',
          true,
          {
            explainMd:
              'Assignment through an instance always writes on the instance, so `a` gains its own `seen` and stops seeing the class one, while `b` still falls back to the shared list. That asymmetry — mutation shared, assignment private — is what makes the bug so confusing to read.'
          }
        ),
        pyCode({
          id: 'own-your-list',
          prompt:
            '> Keep `UNIT = "kph"` shared on the class, but give each `Sensor` its own `seen` list. The script appends to `a.seen` only, so printing `len(b.seen)` should give `0`.',
          equals: '0',
          hidden: true,
          hints: ladder(
            'Two attributes, two lifetimes. Which of them should exist once, and which should exist per sensor?',
            'A per-instance value has to be built during construction, so assign it through `self` inside `__init__`.',
            'The same fix appears with default arguments: `def add(x, bag=None)` plus `if bag is None: bag = []` gives a new list per call.',
            'class Sensor:\n    UNIT = "kph"\n\n    def __init__(self, name):\n        self.name = name\n        self.seen = []\n\n\na = Sensor("wind")\nb = Sensor("soil")\na.seen.append(18)\n\nprint(len(b.seen))'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    UNIT = "kph"
    seen = []

    def __init__(self, name):
        self.name = name


a = Sensor("wind")
b = Sensor("soil")
a.seen.append(18)

print(len(b.seen))
`,
      'hidden_test.py': importAssert(`assert main.Sensor.UNIT == "kph", "UNIT should stay a shared class attribute"
assert "seen" not in main.Sensor.__dict__, "seen should not live on the class"
x = main.Sensor("temp")
y = main.Sensor("soil")
x.seen.append(4)
assert y.seen == [], "each sensor needs its own seen list"
assert x.seen == [4]`)
    }
  })

  out.push({
    doc: lesson({
      id: 'dunder-str-and-repr',
      courseId: 'objects',
      moduleId: 'behave',
      title: 'Two ways to show an object',
      skillIds: ['python.objects'],
      estimatedMinutes: 15,
      blocks: [
        teach({
          heading: 'One for people, one for you',
          idea:
            'By default a printed object shows something like `<__main__.Sensor object at 0x000001>` — the class and an address, which tells a reader nothing. Two methods fix that. `__str__` is the friendly line you would show a person, and `__repr__` is the precise one you want while debugging, ideally close enough to source that you could paste it back.',
          bites:
            'They are reached by different callers, which is the part worth memorising. `print(obj)` and `str(obj)` and an f-string\u2019s `{obj}` want `__str__`; `repr(obj)`, the interactive prompt, `{obj!r}`, and — crucially — **anything inside a container** want `__repr__`. So `print(sensors)` on a list shows the repr of each item, and a class with only `__str__` still prints addresses inside a list. Define only `__repr__` and both callers get it, because `__str__` falls back to it.',
          code: `class Sensor:
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"{self.name} sensor"

    def __repr__(self):
        return f"Sensor({self.name!r})"


wind = Sensor("wind")
print(wind)        # wind sensor      <- __str__
print(repr(wind))  # Sensor('wind')   <- __repr__
print([wind])      # [Sensor('wind')] <- containers use __repr__`,
          mistake:
            'A common mistake is defining only `__str__`, being happy with `print(sensor)`, and then debugging a list of sensors that still shows addresses. The exercise wants both: `str(probe)` as `soil sensor` and `repr(probe)` as `Sensor(\'soil\')`, printed on one line by the f-string already in the starter.'
        }),
        predict(
          'repr-fallback',
          'A class defines `__repr__` but not `__str__`. What does `print(obj)` show?',
          [
            { id: 'address', md: 'The default `<... object at 0x...>` line' },
            { id: 'repr', md: 'The `__repr__` text — `str` falls back to it' }
          ],
          'repr',
          {
            explainMd:
              '`str()` uses `__str__` when the class defines one and otherwise defers to `__repr__`, so a single good `__repr__` improves every display at once. The fallback does not run the other way: defining only `__str__` leaves `repr` — and therefore lists, dicts, and the debugger — showing the default address line.'
          }
        ),
        check(
          'container-uses-repr',
          '`print([wind, soil])` on a list of sensors shows which text for each item?',
          [
            { id: 'repr', md: 'Their `__repr__` text' },
            { id: 'str', md: 'Their `__str__` text' },
            { id: 'mixed', md: 'The first item\u2019s `__str__`, then `__repr__` for the rest' }
          ],
          'repr',
          {
            explainMd:
              'A list builds its own display by calling `repr()` on every element, so friendly `__str__` output never appears inside a container. That is deliberate: nested output is for reading precisely, and an unambiguous repr is what you want when a collection surprises you.'
          }
        ),
        pyCode({
          id: 'both-displays',
          prompt:
            '> Give `Sensor` a `__str__` that reads `soil sensor` and a `__repr__` that reads `Sensor(\'soil\')`, both built from `self.name`. The print line is already written; output should be `soil sensor | Sensor(\'soil\')`.',
          equals: "soil sensor | Sensor('soil')",
          hidden: true,
          hints: ladder(
            'Run the starter first. Both halves of the line show the default display, because the class defines neither method.',
            'Add `__str__(self)` returning the friendly line and `__repr__(self)` returning the precise one. Both take only `self` and return a string.',
            'The `!r` conversion is doing real work: in an f-string, `{self.name!r}` writes `\'wind\'` with the quotes, which is what makes a repr pasteable.',
            'class Sensor:\n    def __init__(self, name):\n        self.name = name\n\n    def __str__(self):\n        return f"{self.name} sensor"\n\n    def __repr__(self):\n        return f"Sensor({self.name!r})"\n\n\nprobe = Sensor("soil")\n\nprint(f"{probe} | {probe!r}")'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    def __init__(self, name):
        self.name = name


probe = Sensor("soil")

print(f"{probe} | {probe!r}")
`,
      'hidden_test.py': importAssert(`gust = main.Sensor("wind")
assert str(gust) == "wind sensor", "__str__ should read like a sentence"
assert repr(gust) == "Sensor('wind')", "__repr__ should look like the call that built it"
assert repr([gust]) == "[Sensor('wind')]"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'equality-and-hash',
      courseId: 'objects',
      moduleId: 'behave',
      title: 'What a dict key needs',
      skillIds: ['python.objects.data'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Equality and hashing travel together',
          idea:
            'Out of the box, `==` on your own objects means "the same object", so two tags built from the same word compare unequal. Defining `__eq__` fixes that by comparing what you care about. But it also does something you did not ask for: Python sets `__hash__` to `None` on that class, and the objects become unhashable.',
          bites:
            'That is not spite, it is arithmetic. A set or dict finds a candidate by hash bucket first and only compares inside the bucket, so two objects that are equal must hash the same or the lookup misses. Python cannot guess which fields your new `__eq__` used, so it refuses to keep the inherited identity hash and makes you write `__hash__` from the same fields. Mutable objects are usually left unhashable on purpose — a key whose hash changes is lost inside the dict.',
          code: `class Tag:
    def __init__(self, name):
        self.name = name

    def __eq__(self, other):
        return isinstance(other, Tag) and self.name == other.name

    def __hash__(self):
        return hash(self.name)


print(Tag("soil") == Tag("soil"))     # True
print(len({Tag("soil"), Tag("soil")}))  # 1 — the set folded them together`,
          mistake:
            'A common mistake is adding `__eq__`, seeing `==` behave, and only discovering the missing `__hash__` when a set raises `TypeError: unhashable type`. The exercise asks for both from the start: `len({Tag("soil"), Tag("soil"), Tag("wind")})` must come out as `2`.'
        }),
        predict(
          'eq-without-hash',
          'A class defines `__eq__` and nothing else. What does `{obj}` — a set holding one of them — do?',
          [
            { id: 'works', md: 'Works fine; the set uses the identity hash it inherited' },
            { id: 'raises', md: 'Raises `TypeError: unhashable type` — defining `__eq__` cleared `__hash__`' }
          ],
          'raises',
          {
            explainMd:
              'Python sets `__hash__ = None` on any class that defines `__eq__` without one, because the inherited identity hash would disagree with your new equality and break lookups silently. Failing loudly at the first set or dict use is the safer trade, and the fix is a `__hash__` built from the same fields.'
          }
        ),
        tf(
          'equal-means-same-hash',
          'Two objects that compare equal must return the same hash for sets and dicts to work.',
          true,
          {
            explainMd:
              'A dict narrows the search by hash before it ever calls `==`, so equal objects with different hashes land in different buckets and the second one is never found. The reverse is allowed: unequal objects may share a hash, and the container just compares the few candidates in that bucket.'
          }
        ),
        pyCode({
          id: 'hashable-tag',
          prompt:
            '> Give `Tag` an `__eq__` that compares `name` and a matching `__hash__`, so equal tags fold together in a set. Printing `len({Tag("soil"), Tag("soil"), Tag("wind")})` should give `2`.',
          equals: '2',
          hidden: true,
          hints: ladder(
            'The starter prints `3`: with the default equality, every `Tag` is distinct from every other, even with the same name.',
            'Two methods are needed. `__eq__(self, other)` compares the fields; `__hash__(self)` returns a hash built from the same fields.',
            'You rarely invent a hash — `hash(self.name)` reuses the string\u2019s, and for several fields `hash((self.a, self.b))` hashes the tuple.',
            'class Tag:\n    def __init__(self, name):\n        self.name = name\n\n    def __eq__(self, other):\n        return isinstance(other, Tag) and self.name == other.name\n\n    def __hash__(self):\n        return hash(self.name)\n\n\nprint(len({Tag("soil"), Tag("soil"), Tag("wind")}))'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Tag:
    def __init__(self, name):
        self.name = name


print(len({Tag("soil"), Tag("soil"), Tag("wind")}))
`,
      'hidden_test.py': importAssert(`a = main.Tag("soil")
b = main.Tag("soil")
assert a == b, "tags with the same name should be equal"
assert hash(a) == hash(b), "equal tags must hash the same"
assert len({a, b}) == 1
assert a != main.Tag("wind")
assert {a: 1}[b] == 1, "an equal tag should find the same dict entry"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'dataclasses',
      courseId: 'objects',
      moduleId: 'behave',
      title: 'Records without the boilerplate',
      skillIds: ['python.objects.data'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Declare the fields, get the plumbing',
          idea:
            'Plenty of classes are just a named bundle of values, and writing `__init__`, `__repr__`, and `__eq__` for each one by hand is tedious and easy to get subtly wrong. `@dataclass` reads the annotated names in the class body and generates those methods from them, so `Reading(name: str, value: int)` gains a constructor, a readable repr, and field-by-field equality with no method bodies at all.',
          bites:
            'The annotations are what the decorator reads, so `value: int` is required for the field to be seen — a bare `value = 0` is treated as a plain class attribute and never becomes a parameter. Note that the hint is not enforced at runtime: `Reading("soil", "wet")` builds happily. Adding `frozen=True` blocks attribute assignment after construction, raising `FrozenInstanceError`, and in exchange the class gets a `__hash__`, so frozen records work as dict keys and set members.',
          code: `from dataclasses import dataclass


@dataclass(frozen=True)
class Reading:
    name: str
    value: int


a = Reading("soil", 11)
print(a)                                      # Reading(name='soil', value=11)
print(a == Reading("soil", 11))               # True — field-by-field
print(hash(a) == hash(Reading("soil", 11)))   # True — frozen, so hashable`,
          mistake:
            'A common mistake is expecting `frozen=True` to freeze what the fields point at; it only stops rebinding on the instance, so a list inside a frozen record can still be appended to. The exercise rewrites `Reading` as a frozen dataclass with `name: str` and `value: int` — printing the instance must give `Reading(name=\'soil\', value=11)`.'
        }),
        check(
          'what-dataclass-writes',
          'What does `@dataclass` generate from the annotated fields?',
          [
            { id: 'three', md: '`__init__`, `__repr__`, and `__eq__`' },
            { id: 'getters', md: 'A getter and a setter method for each field' },
            { id: 'validation', md: 'Runtime checks that each argument matches its annotation' }
          ],
          'three',
          {
            explainMd:
              'Those three cover the boring half of a record class, and options like `order=True` or `frozen=True` add more. What it never adds is type checking — the annotations are read to find the field names and order, and a wrong type still constructs without complaint.'
          }
        ),
        tf(
          'frozen-is-hashable',
          '`frozen=True` makes instances hashable, so a record can be used as a dict key.',
          true,
          {
            explainMd:
              'Freezing means the fields cannot be rebound, so the hash computed from them stays valid for the object\u2019s whole life — and that is exactly the promise a dict key has to make. A mutable dataclass is left unhashable, because a key whose hash drifted would be unfindable.'
          }
        ),
        pyCode({
          id: 'frozen-reading',
          prompt:
            '> Rewrite `Reading` as a **frozen** dataclass with fields `name: str` and `value: int`. Printing `Reading("soil", 11)` should give `Reading(name=\'soil\', value=11)`.',
          equals: "Reading(name='soil', value=11)",
          hidden: true,
          hints: ladder(
            'Run the starter: it prints an address, because a hand-written class has no repr and this one has no equality either.',
            'Import `dataclass` from `dataclasses`, decorate the class with `@dataclass(frozen=True)`, and replace the whole `__init__` with two annotated field lines.',
            'The field lines are declarations, not assignments: `cols: int` on its own line is a required field, while `cols: int = 5` gives it a default.',
            'from dataclasses import dataclass\n\n\n@dataclass(frozen=True)\nclass Reading:\n    name: str\n    value: int\n\n\nprint(Reading("soil", 11))'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Reading:
    def __init__(self, name, value):
        self.name = name
        self.value = value


print(Reading("soil", 11))
`,
      'hidden_test.py': importAssert(`import dataclasses

r = main.Reading("soil", 11)
assert dataclasses.is_dataclass(r), "Reading should be a dataclass"
assert r == main.Reading("soil", 11), "a dataclass compares field by field"
assert repr(r) == "Reading(name='soil', value=11)"
assert hash(r) == hash(main.Reading("soil", 11)), "frozen records are hashable"
try:
    r.value = 12
except dataclasses.FrozenInstanceError:
    pass
else:
    raise AssertionError("frozen=True should refuse the assignment")`)
    }
  })

  out.push({
    doc: lesson({
      id: 'properties-not-getters',
      courseId: 'objects',
      moduleId: 'behave',
      title: 'Attribute syntax, method behaviour',
      skillIds: ['python.objects.data'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Python does not want a getter for every field',
          idea:
            'In some languages every field hides behind `getX()` in case the reading ever needs to be computed. Python does not need that insurance, because `@property` can turn a plain attribute read into a method call later without touching a single caller. So you expose the attribute, and only reach for a property when there is real work to do.',
          bites:
            'A property is read with no parentheses — `probe.fahrenheit`, not `probe.fahrenheit()` — which is the whole point: callers cannot tell whether they hit stored state or a calculation. Two jobs suit it. One is a value derived from other attributes, so it can never drift out of date. The other is a guard: the matching `@name.setter` is where a bad value is rejected with a `ValueError` at the moment it is assigned rather than three functions later.',
          code: `class Sensor:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def fahrenheit(self):
        return round(self.celsius * 9 / 5 + 32, 1)


probe = Sensor(20)
print(probe.fahrenheit)   # 68.0 — no parentheses, computed on the spot
probe.celsius = 100
print(probe.fahrenheit)   # 212.0 — derived, so it cannot go stale`,
          mistake:
            'A common mistake is adding parentheses out of habit; `probe.fahrenheit()` calls the number the property returned, which raises `TypeError: \'float\' object is not callable`. The exercise replaces the starter\u2019s `get_fahrenheit()` with a `fahrenheit` property, so the print line becomes `probe.fahrenheit`.'
        }),
        predict(
          'read-a-property',
          '`fahrenheit` is a `@property`. How do you read it?',
          [
            { id: 'plain', md: '`probe.fahrenheit`' },
            { id: 'call', md: '`probe.fahrenheit()`' }
          ],
          'plain',
          {
            explainMd:
              'The property machinery runs the method during the attribute lookup itself, so the plain name already gives you the computed value. Adding parentheses tries to call that result — usually a number or a string — and raises `TypeError: object is not callable`.'
          }
        ),
        check(
          'why-no-getters',
          'Why does Python not need a `get_x()` for every attribute?',
          [
            {
              id: 'later',
              md: 'Because a plain attribute can become a property later without changing any caller'
            },
            { id: 'private', md: 'Because attributes are private by default, so nothing can reach them' },
            { id: 'never', md: 'Because Python has no way to run code on an attribute read' }
          ],
          'later',
          {
            explainMd:
              'The getter exists in other languages to protect the option of computing the value one day. `@property` hands you that option for free after the fact, so writing the wrapper up front buys nothing and costs every caller a pair of parentheses.'
          }
        ),
        tf(
          'setter-guards',
          'A matching `@fahrenheit.setter` is where you would reject a bad value with `ValueError`.',
          true,
          {
            explainMd:
              'The setter runs on assignment, so it is the earliest place a nonsense value can be refused — the object never holds it at all. Validating at the boundary like that keeps the failure next to the mistake instead of surfacing much later in whatever code trusted the attribute.'
          }
        ),
        pyCode({
          id: 'fahrenheit-property',
          prompt:
            '> Replace `get_fahrenheit()` with a `fahrenheit` **property** computed from `self.celsius`, and read it without parentheses. Output should be `68.0`.',
          equals: '68.0',
          hidden: true,
          hints: ladder(
            'The starter already computes the right number. What has to change is how callers reach it.',
            'Decorate the method with `@property` and rename it to the attribute name you want, then drop the parentheses at the call site.',
            'Another example: `@property def area(self): return self.cols * self.rows` lets `grid.area` stay correct after `grid.cols` changes.',
            'class Sensor:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @property\n    def fahrenheit(self):\n        return round(self.celsius * 9 / 5 + 32, 1)\n\n\nprobe = Sensor(20)\n\nprint(probe.fahrenheit)'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    def __init__(self, celsius):
        self.celsius = celsius

    def get_fahrenheit(self):
        return round(self.celsius * 9 / 5 + 32, 1)


probe = Sensor(20)

print(probe.get_fahrenheit())
`,
      'hidden_test.py': importAssert(`s = main.Sensor(100)
assert isinstance(type(s).__dict__.get("fahrenheit"), property), "fahrenheit should be a property"
assert s.fahrenheit == 212.0
s.celsius = 0
assert s.fahrenheit == 32.0, "a derived property should follow the attribute it is built from"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'inheritance-basics',
      courseId: 'objects',
      moduleId: 'reuse',
      title: 'A subclass that is-a base class',
      skillIds: ['python.objects'],
      estimatedMinutes: 16,
      blocks: [
        teach({
          heading: 'Say the base class once',
          idea:
            'Writing `class SoilSensor(Sensor):` says that a soil sensor **is a** sensor. Every attribute and method on `Sensor` is reachable on the subclass without being copied, and any method you redefine in the subclass body **overrides** the inherited one for those instances. `isinstance(probe, Sensor)` is then `True`, which is what lets one function handle every kind of sensor.',
          bites:
            'The detail that makes overriding powerful is that inherited methods still go through the instance. `Sensor.describe` calls `self.label()`, and on a `SoilSensor` that `self.label` finds the subclass\u2019s version — so one inherited method changes behaviour without being touched. Apply the is-a test out loud before subclassing: "a soil sensor is a sensor" holds, while "a station is a log" does not, even though a station clearly needs a log.',
          code: `class Sensor:
    def label(self):
        return "sensor"

    def describe(self):
        return self.label() + " on the ridge"


class WindSensor(Sensor):
    def label(self):
        return "wind sensor"


w = WindSensor()
print(w.describe())            # wind sensor on the ridge — inherited, but overridden label
print(isinstance(w, Sensor))   # True`,
          mistake:
            'A common mistake is copying the base methods into the second class instead of inheriting, which passes today and drifts apart the first time one copy is fixed. The exercise gives you a `SoilSensor` that duplicates `describe`: make it subclass `Sensor`, override only `label`, and delete the copy.'
        }),
        predict(
          'override-through-self',
          '`SoilSensor(Sensor)` overrides `label`. The inherited `describe` calls `self.label()`. Which `label` runs?',
          [
            { id: 'base', md: '`Sensor.label`, because `describe` was defined in `Sensor`' },
            { id: 'sub', md: '`SoilSensor.label`, because `self` is a `SoilSensor`' }
          ],
          'sub',
          {
            explainMd:
              'Attribute lookup starts at the instance\u2019s own class and only then walks up to the base, so `self.label` finds the subclass version no matter which class the calling method was written in. That is the mechanism behind every "override one piece, reuse the rest" design.'
          }
        ),
        check(
          'is-a-test',
          'Which of these passes the is-a test, and so justifies a subclass?',
          [
            { id: 'soil', md: 'A soil sensor is-a sensor' },
            { id: 'station', md: 'A station is-a log' },
            { id: 'reading', md: 'A reading is-a station' }
          ],
          'soil',
          {
            explainMd:
              'Inheritance claims that the subclass can stand in for the base anywhere, so the sentence has to be true of the *thing*, not merely convenient for your code. A station keeps a log and holds readings, so those are has-a relationships and belong in attributes rather than in a base class.'
          }
        ),
        pyCode({
          id: 'subclass-not-copy',
          prompt:
            '> Make `SoilSensor` a subclass of `Sensor`, override only `label` so it returns `soil sensor`, and inherit `describe` instead of copying it. Output should be `soil sensor on the ridge`.',
          equals: 'soil sensor on the ridge',
          hidden: true,
          hints: ladder(
            'The two classes in the starter share an identical `describe`. Nothing links them, so the duplication is real.',
            'Name the base in the class header — `class SoilSensor(Sensor):` — and then remove every method the base already provides correctly.',
            'The remaining override does not need to know about `describe`: `describe` asks `self.label()`, and `self` is a `SoilSensor`.',
            'class Sensor:\n    def label(self):\n        return "sensor"\n\n    def describe(self):\n        return self.label() + " on the ridge"\n\n\nclass SoilSensor(Sensor):\n    def label(self):\n        return "soil sensor"\n\n\nprobe = SoilSensor()\n\nprint(probe.describe())'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    def label(self):
        return "sensor"

    def describe(self):
        return self.label() + " on the ridge"


class SoilSensor:
    def label(self):
        return "soil sensor"

    def describe(self):
        return self.label() + " on the ridge"


probe = SoilSensor()

print(probe.describe())
`,
      'hidden_test.py': importAssert(`probe = main.SoilSensor()
assert isinstance(probe, main.Sensor), "SoilSensor should subclass Sensor"
assert probe.describe() == "soil sensor on the ridge"
assert "describe" not in main.SoilSensor.__dict__, "inherit describe instead of copying it"
assert main.Sensor().describe() == "sensor on the ridge", "leave the base class working"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'super-and-mro',
      courseId: 'objects',
      moduleId: 'reuse',
      title: 'Letting the base do its half',
      skillIds: ['python.objects'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'super() picks the next class in line',
          idea:
            'A subclass `__init__` usually has extra work to do, not different work. `super().__init__(name)` runs the base constructor first so it can set everything it owns, and then you add the fields that are yours. Skip that call and every attribute the base was responsible for simply never exists, which surfaces later as an `AttributeError` far from the cause.',
          bites:
            '`super()` does not mean "my parent class" — it means "the next class after me in this instance\u2019s **method resolution order**", the flat list Python builds from the whole inheritance graph. You can read it with `Cls.__mro__`, and it always ends in `object`. For a single base the distinction never shows, but with two bases it is what makes a chain of `super()` calls reach every class exactly once instead of running one twice and skipping another.',
          code: `class Sensor:
    def __init__(self, name):
        self.name = name
        self.ready = True


class WindSensor(Sensor):
    def __init__(self, name, kph):
        super().__init__(name)   # base sets name and ready
        self.kph = kph


w = WindSensor("wind", 18)
print(w.name, w.kph, w.ready)                     # wind 18 True
print([c.__name__ for c in WindSensor.__mro__])   # ['WindSensor', 'Sensor', 'object']`,
          mistake:
            'A common mistake is re-assigning `self.name` in the subclass because it looks like the same job, which quietly skips everything else the base did. The exercise\u2019s `Sensor` also sets `ready`: call `super().__init__(name)` from `SoilSensor` so `probe.ready` exists, then store `percent` yourself.'
        }),
        predict(
          'skipped-super',
          'A subclass `__init__` sets `self.name` itself and never calls `super().__init__`. What happens to the other attributes the base sets?',
          [
            { id: 'still', md: 'They are still set — the base `__init__` runs first automatically' },
            { id: 'missing', md: 'They never exist, and reading one raises `AttributeError`' }
          ],
          'missing',
          {
            explainMd:
              'Python calls exactly one `__init__` — the most derived one — and nothing chains for you. If your override does not call up, the base constructor never runs, so any attribute only it created is absent until something reads it and fails.'
          }
        ),
        cloze(
          'mro-vocabulary',
          'The order `super()` follows is the {{a}}, and you can read it on a class as {{b}}.',
          [
            { id: 'a', choices: ['method resolution order', 'class body', 'call stack'] },
            { id: 'b', choices: ['__mro__', '__dict__', '__init__'] }
          ],
          { a: 'method resolution order', b: '__mro__' },
          {
            explainMd:
              'Python flattens the inheritance graph into one linear list per class, and every attribute lookup and `super()` hop walks that list in order. Printing `Cls.__mro__` is the fastest way to answer "who actually runs next" when a hierarchy surprises you.'
          }
        ),
        pyCode({
          id: 'call-super-init',
          prompt:
            '> `SoilSensor.__init__` takes `name` and `percent`. Call `super().__init__(name)` so the base still sets `name` **and** `ready`, then store `percent`. Printing `probe.name` and `probe.percent` should give `soil 11`.',
          equals: 'soil 11',
          hidden: true,
          hints: ladder(
            'The starter prints the right two values, but the base constructor never ran, so `probe.ready` does not exist.',
            'Let the base set what it owns: call `super().__init__(name)` as the first line of the subclass `__init__`, then add your own field.',
            'The same pattern outside constructors: an overridden `describe` can call `super().describe()` and append to the result rather than rewriting it.',
            'class Sensor:\n    def __init__(self, name):\n        self.name = name\n        self.ready = True\n\n\nclass SoilSensor(Sensor):\n    def __init__(self, name, percent):\n        super().__init__(name)\n        self.percent = percent\n\n\nprobe = SoilSensor("soil", 11)\n\nprint(probe.name, probe.percent)'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    def __init__(self, name):
        self.name = name
        self.ready = True


class SoilSensor(Sensor):
    def __init__(self, name, percent):
        self.name = name
        self.percent = percent


probe = SoilSensor("soil", 11)

print(probe.name, probe.percent)
`,
      'hidden_test.py': importAssert(`from pathlib import Path

src = Path("main.py").read_text(encoding="utf-8")
assert "super(" in src, "call super().__init__(name) from the subclass"
probe = main.SoilSensor("soil", 11)
assert probe.name == "soil" and probe.percent == 11
assert probe.ready is True, "the base __init__ never ran, so ready was never set"
assert main.SoilSensor.__mro__[1] is main.Sensor`)
    }
  })

  out.push({
    doc: lesson({
      id: 'composition-over-inheritance',
      courseId: 'objects',
      moduleId: 'reuse',
      title: 'Hold it instead of becoming it',
      skillIds: ['python.objects'],
      estimatedMinutes: 17,
      blocks: [
        teach({
          heading: 'Has-a beats is-a most of the time',
          idea:
            'Inheritance is the loudest way to reuse code: it takes every public method of the base and puts it on your class, whether or not those methods make sense there. Composition is the quiet way — hold the other object in an attribute and call it. A station keeps a log, so `self.log = Log()` says exactly that and exposes only the one method the station actually wants to offer.',
          bites:
            'Subclassing for reuse leaks. `class Station(Log)` gives every caller `station.add(...)`, `station.lines`, and anything the log grows later, so the station\u2019s surface changes when a file you were only borrowing from changes. It also spends your one base class on a borrowing relationship. The smell to watch for is a hierarchy four or five deep where you have to read every level to answer what one method does — that is usually several has-a relationships wearing an is-a costume.',
          code: `class Log:
    def __init__(self):
        self.lines = []

    def add(self, line):
        self.lines.append(line)


class Station:
    def __init__(self):
        self.log = Log()      # the station HAS a log

    def record(self, line):
        self.log.add(line)
        return len(self.log.lines)


s = Station()
print(s.record("wind 18"))    # 1
print(isinstance(s, Log))     # False — and nothing wanted it to be`,
          mistake:
            'A common mistake is subclassing because the base already has the method you need, which is borrowing an implementation while promising to *be* that thing. The exercise starts from `class Station(Log)`: move the log into `self.log`, keep `record` working, and leave `Station` with no claim to be a log.'
        }),
        check(
          'read-the-relationship',
          'Which sentence describes a station and a log correctly?',
          [
            { id: 'has', md: 'A station has-a log' },
            { id: 'is', md: 'A station is-a log' },
            { id: 'either', md: 'Either one — they mean the same thing in Python' }
          ],
          'has',
          {
            explainMd:
              'A station uses a log for one job among many; it is not a kind of log and could not stand in for one. Encoding that as an attribute keeps the log swappable and keeps the station\u2019s public surface down to the methods a station should offer.'
          }
        ),
        tf(
          'inheritance-leaks',
          'Subclassing puts every public method of the base onto your class, whether or not those methods make sense there.',
          true,
          {
            explainMd:
              'That is the whole point of inheritance — the subclass can stand in for the base — but it means you inherit the base\u2019s future as well as its present. Composition exposes only what you choose to forward, so a change inside the collaborator cannot widen your own interface.'
          }
        ),
        pyCode({
          id: 'compose-the-log',
          prompt:
            '> `Station` currently inherits from `Log`. Rewrite it to **hold** a `Log` in `self.log` instead, keeping `record(line)` returning the number of lines so far. Output should be `1`.',
          equals: '1',
          hidden: true,
          hints: ladder(
            'Ask the is-a question about the starter: is a station a kind of log? Everything the log can do is currently on the station.',
            'Drop the base class from the header, build a `Log()` in `Station.__init__`, and reach the log through that attribute.',
            'Forward only what you mean to offer: `record` calls `self.log.add(line)`, and callers never learn that a `Log` is in there.',
            'class Log:\n    def __init__(self):\n        self.lines = []\n\n    def add(self, line):\n        self.lines.append(line)\n\n\nclass Station:\n    def __init__(self):\n        self.log = Log()\n\n    def record(self, line):\n        self.log.add(line)\n        return len(self.log.lines)\n\n\nstation = Station()\n\nprint(station.record("wind 18"))'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Log:
    def __init__(self):
        self.lines = []

    def add(self, line):
        self.lines.append(line)


class Station(Log):
    def record(self, line):
        self.add(line)
        return len(self.lines)


station = Station()

print(station.record("wind 18"))
`,
      'hidden_test.py': importAssert(`fresh = main.Station()
assert not isinstance(fresh, main.Log), "a station is not a kind of log"
assert isinstance(fresh.log, main.Log), "hold the log in self.log"
assert fresh.record("wind 18") == 1
assert fresh.record("soil 11") == 2
assert fresh.log.lines == ["wind 18", "soil 11"]
assert main.Station().log.lines == [], "each station needs its own log"`)
    }
  })

  out.push({
    doc: lesson({
      id: 'transfer-model-a-station',
      courseId: 'objects',
      moduleId: 'reuse',
      title: 'Transfer: model the field station',
      skillIds: ['python.objects', 'python.objects.data'],
      estimatedMinutes: 22,
      mastery: { requiresTransfer: true },
      blocks: [
        teach({
          heading: 'Two classes and one honest relationship',
          idea:
            'Nothing new here — this is the whole module used at once on a new shape. A reading from one instrument is a small bundle of values, which is a class of its own. A station is the thing that owns a set of instruments and can speak about all of them, which is a second class. The relationship between them is has-a, so the station holds sensors in an attribute rather than inheriting from one.',
          bites:
            'Two traps from earlier in the module are waiting. The list of sensors must be built in `__init__` and not in the class body, or every station on the ridge shares one list and a fresh station reports somebody else\u2019s readings. And the empty case needs a decision made on purpose: joining nothing gives an empty tail, so a station with no sensors should say so in words rather than trailing off after the colon.',
          code: `class Reading:
    def __init__(self, name, value):
        self.name = name
        self.value = value


class Panel:
    def __init__(self, title):
        self.title = title
        self.rows = []            # per instance, on purpose

    def add(self, row):
        self.rows.append(row)
        return row


panel = Panel("Ridge")
panel.add(Reading("soil", 11))
print(panel.title, len(panel.rows))   # Ridge 1`,
          mistake:
            'A common mistake is letting `Station` inherit from `list` so it gets `append` for free, which makes a station claim to be a sequence of sensors and drags every list method along. Build the two classes and give the station a `summary()` that reads `Ridge: soil=11, wind=18`, or `Ridge: no sensors` when nothing has been added.'
        }),
        check(
          'where-the-list-lives',
          'The station has to hold several sensors. Where should that list live?',
          [
            { id: 'init', md: 'Built in `__init__` as `self.sensors = []`' },
            {
              id: 'classbody',
              md: 'In the class body as `sensors = []`, so the class owns it',
              misconceptionId: 'class-attr-is-per-instance'
            },
            { id: 'inherit', md: 'Nowhere — make `Station` inherit from `list`' }
          ],
          'init',
          {
            explainMd:
              'A list in the class body is created once and shared by every station, so the second station starts life holding the first one\u2019s sensors. Inheriting from `list` is worse in a different way: it makes a station claim to *be* a sequence and inherits `sort`, `pop`, and the rest whether they make sense or not.'
          }
        ),
        predict(
          'empty-summary',
          '`", ".join([])` returns what, and what does that mean for a station with no sensors?',
          [
            { id: 'raises', md: 'It raises, so the empty case needs a `try`' },
            { id: 'empty', md: '`""`, so the naive summary trails off after the colon and needs its own branch' }
          ],
          'empty',
          {
            explainMd:
              'Joining an empty list is perfectly legal and gives the empty string, which is why the bug is easy to ship — the output is not an error, just a half-finished sentence. Deciding the empty wording up front is cheaper than discovering it in a report someone else is reading.'
          }
        ),
        pyCode({
          id: 'model-the-station',
          prompt:
            '> Build `Sensor(name, value)` and `Station(name)`. A station **holds** sensors: `station.add(sensor)` keeps it, and `station.summary()` returns the station name, a colon and a space, then each sensor as `name=value` in the order added, joined with `, `. With no sensors, `summary()` returns `<name>: no sensors`. Output should be `Ridge: soil=11, wind=18`.',
          equals: 'Ridge: soil=11, wind=18',
          hidden: true,
          hints: ladder(
            'Two classes and one attribute. `Sensor` only has to remember two values; `Station` has to remember its name and the sensors handed to it.',
            'Give `Station.__init__` a `self.sensors = []`, append in `add`, and build `summary()` from a list of `f"{s.name}={s.value}"` strings joined with `", "`.',
            'Handle the empty case before joining: `if not self.sensors: return f"{self.name}: no sensors"` keeps the branch out of the formatting line.',
            'class Sensor:\n    def __init__(self, name, value):\n        self.name = name\n        self.value = value\n\n\nclass Station:\n    def __init__(self, name):\n        self.name = name\n        self.sensors = []\n\n    def add(self, sensor):\n        self.sensors.append(sensor)\n        return sensor\n\n    def summary(self):\n        if not self.sensors:\n            return f"{self.name}: no sensors"\n        parts = [f"{s.name}={s.value}" for s in self.sensors]\n        return f"{self.name}: " + ", ".join(parts)\n\n\nstation = Station("Ridge")\nstation.add(Sensor("soil", 11))\nstation.add(Sensor("wind", 18))\n\nprint(station.summary())'
          )
        })
      ]
    }),
    files: {
      'main.py': `class Sensor:
    def __init__(self, name, value):
        self.name = name
        self.value = value


class Station:
    def __init__(self, name):
        self.name = name

    def add(self, sensor):
        return sensor

    def summary(self):
        return self.name + ": "


station = Station("Ridge")
station.add(Sensor("soil", 11))
station.add(Sensor("wind", 18))

print(station.summary())
`,
      'hidden_test.py': importAssert(`creek = main.Station("Creek")
assert creek.summary() == "Creek: no sensors", "say so when nothing has been added"
creek.add(main.Sensor("temp", 4))
assert creek.summary() == "Creek: temp=4"
creek.add(main.Sensor("wind", 22))
assert creek.summary() == "Creek: temp=4, wind=22", "keep the order the sensors were added in"
assert not isinstance(creek, main.Sensor), "a station holds sensors; it is not one"
assert main.Station("Ridge").summary() == "Ridge: no sensors", "each station needs its own sensor list"`)
    }
  })

  return out
}
