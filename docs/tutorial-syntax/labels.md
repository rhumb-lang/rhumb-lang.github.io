---
sidebar_position: 1
---

# Labels

Labels are anything that is named. **All** named things in Rhumb are elements provided by the programmer or through libraries. Rhumb, the language, only has **two** words that are reserved from being labels (but they are reserved across all human languages):

- `yes`; `oui`; `ja`; `da`; `nai`; `vâng`
- `no`; `non`; `nein`; `ne`; `ochi`; `không`

Only one set will be active in a given project at the source level. IDE plugins will provide translation of this and other labels via a builtin service and supporting translation file format.

## Label Syntax

Labels can be any value that starts with a unicode letter codepoint and can be followed by any number of unicode letter/number codepoints intermixed with dashes, dots, and underscores.

```rhumb
label
label-with-dash
label_with_underscore
label.with.period
label-with_all.extra
l0-b1_f_10.boolean
```

You can encode non-breaking filenames directly as labels in many cases.

```rhumb
favicon.ico
```

You could treat the extension like a type tag:

```rhumb
can-run.count
can-run.test
```

:::danger Warning: Conventional Wisdom Abandoned

You might think that `count` and `test` are sub-elements of a `can-run` object but that is not how Rhumb works. Each line is a single label representing a single value in memory.

:::

## Label Semantics

As indicated in the warning above, each label represents a value or object in memory. Labels are "variables" as they are called in some languages. Although in Rhumb, labels are really just fields of the local scope map. The distinction between a mutable label and an immutable one is decided at assignment, there is no special declaration keyword like `let` or `const`. More on the topic of assignment later.

## Label Search Algorithm

Labels exist within a **context** and each new line of the program extends the context's list of locals in time. Each new addition to the context is only accessible by code following it in the file. If the current context is exhausted, the VM will traverse up to a lexically "outer" scope and perform search again (later assigned labels will not be accessible in earlier contexts). This continues up-and-outward until all contexts have been exhausted at which time the VM will error out.
