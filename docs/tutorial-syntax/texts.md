---
sidebar_position: 4
---

# Texts

Collections of runes that represent text. In Rhumb, these are
delimited with either single or double quote marks. In other
languages, these are called "strings".

:::info Text Syntax Used

The syntax used doesn't really change the stored value that
is eventually placed in memory. It's more about how it's parsed
and compiled.

:::


## Raw Text

Delimited with the `'` symbol (single-quote), the raw text is for
text that you don't have any special formatting or code inside
of the text.

```rhumb
'raw'
'nothing happening'
'no special syntax'
```

## Text

Delimited with the `"` symbol (double-quote), this syntax is for
text that you want to utilize escape-sequences and interpolated
labels.

```rhumb
"nothing special here"
"newline`nthere"
"tab`tcharacter"
"interpolated: $thing"
"interpolation routine: $(do;several;things)"
```

As you can see, escape sequences use the ``` ` ``` character as
a prefix instead of the common `\` due to a syntax collision with
map member access.

Interpolation is done with the `$` symbol and can be followed
by a label (plus inner map access is supported). You can do
arbitrary series of expressesions with the `$()` syntax.



