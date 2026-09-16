import main

assert isinstance(main.KNOWN, (set, frozenset)), "KNOWN has to be a set, not a list"
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
assert Counted.probes <= 1, "a set lookup hashes once; it must not walk the names"
