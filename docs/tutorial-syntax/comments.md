---
sidebar_position: 0
---

# Comments

Rhumb uses the percent sign (`%`) for comments and meta-annotations.

| Symbol      | Name          | Syntax                            | Semantics                                                                                                                                                                                                                                                                                                                                   |
| :---------- | :------------ | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`%`**     | Line Comment  | `% text`                          | Ignored by Parser. Continues to end of line.                                                                                                                                                                                                                                                                                                |
| **`%( %)`** | Block Comment | `%( text %)`                      | Ignored by Parser. Can be nested.                                                                                                                                                                                                                                                                                                           |
| **`%=`**    | Assertion     | `x %= str [% optional test name]` | **Meta-Operator.** Ignored by Runtime. In Test Mode, asserts that the **String Representation** of the expression matches the **Raw Text** provided on the right. No parsing or evaluation is performed on the right-hand side. Optionally has a test name when the assertion is separated from the end of line by another % comment symbol |
| **`%?`**    | Inspection    | `expr %?`                         | **Meta-Operator.** Ignored by Runtime. In Test Mode, it acts as the **"Bless" / "What is this?"** operator. It triggers an inspection log to stdout, allowing the user to copy the output and "bless" a test by pasting it into a `%=` assertion.                                                                                           |

# Examples

```rhumb
x := 1 + 1 % this is a line comment

%( this is a block
    comment that
    spans multiple
    lines %)

x %= 2 % this is a successful assertion
x %= 1 % this is a failed assertion

x %? % this will print an inspection log to stdout
```
