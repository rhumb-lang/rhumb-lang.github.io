---
sidebar_position: 10
---

# References

Rhumb is a very dynamic language where things often just slot into place for you. This works because of calling conventions and using a dynamic object representation (called "maps" in Rhumb). In order to still keep the expressive syntax as succcinct as possible, Rhumb tries to be a little clever about subroutines and maps.

While most values will just evaluate to themselves, maps evaluate to a reference and subroutines evaluate to a result. You can force a subroutine to evaluate to a map reference by surrounding in `<...>` angle brackets. You can force a map reference to evaluate to a new copy of the map value by using the `[:]` field op.

These two inverted calling conventions allows Rhumb to be more succinct where it matters and also remain more comprehensible in the process. 

## Referred Map

All maps are passed by reference, to break away from a reference, you must copy a map or use a new map literal and just reassign the fields as appropriate.

## Referred Subroutine

All subroutines are passed by evaluated result, to break away from this, you must rap the subroutine's label in angle brackets. This will cause you to pass the subroutine's map by reference.

## Referred Selector

All selectors are passed by evaluated result, to break away from this, you must rap the selector's label in angle brackets. This will cause you to pass the selector's map by reference.

## Computed Reference

You can build a string within angle brackets and that string will be considered a reference path to some value in memory.