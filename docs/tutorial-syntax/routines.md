---
sidebar_position: 3
---

# Routines

Collections of sequential expressions. Routines are your basic
parentheses-based grouping mechanism.

```plain
(one;2)
```

Two labels in a routine. In Rhumb, the only separator is `;` as
the `,` operator is non-existent.

Routines are evaluated first and each one contains a mini-environment
that you can provide new label bindings or any other expressions.

## Subroutines

When you want to store a routine and execute it at a later time,
place it in `<()>` and it will be converted into a reference routine.
Reference routines are known as **subroutines** in Rhumb.

```plain
<(foo; bar)>
```
You would then supply a label to this value and could invoke it at
a later time. These subroutines are just reusable code but there
is a way to supply unlabeled arguments. More on that later.

## Invocation

You could give that subroutine a label of `baz` and then could invoke
it at a later time with `()` the invocation operators (parentheses).

```plain
baz()
```

This one should feel familiar to programmers, you just can't get
away from the postcircumfix parentheses! You can supply arguments
to the subroutine by inserting values and using the `;` operator.

```plain
baz(1; two)
```
:::tip Why no comma operator?

Because commas are part of numbers as per some cultural conventions.
Commas don't make sense in labels like periods do so they are used
only in the number token.

:::

