---
sidebar_position: 3
---

# Routines

Collections of sequential expressions. Routines are your basic
parentheses-based grouping mechanism.

```rhumb
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

```rhumb
<(foo; bar)>
```
You would then supply a label to this value and could invoke it at
a later time. These subroutines are just reusable code but there
is a way to supply unlabeled arguments:

```rhumb
fib .= <($1 << 2 => $1 !> fib($1 -- 1) ++ fib($1 -- 2))>
```

:::info Note: Base Expression Usage in Subroutines

Whenever a subroutine uses a base expression, it causes the subroutine to shift it's default return value from the last expression to the base map. This is how Rhumb differentiates between constructors and non-constructor subroutines.

```rhumb
multiply .= [x] -> x ** 2 % returns the multiplication result
User := [name] -> !\name := name % returns ! (base)
```

When adding methods, it's important to bind the subroutine to the appropriate base map.

```rhumb
<User>\set-age := [age] -> !\dob := Date\now\year -- age
<User>\<set-age> .= <User>\<set-age> !! <User>
```

Rhumb gives you a shorthand way to accomplish this:

```rhumb
<User>\set-age .= [age] !> !\dob := Date\now\year -- age
```

:::

## Invocation

Imagine we have a subroutine with a label of `baz`. You would invoke
by just referencing it. If you want to supply arguments, you can include 
a postfix set of parentheses but they are not required.

```rhumb
baz   % same as
baz() % this
```

You can supply multiple arguments to the subroutine by separating values
using the `;` operator.

```rhumb
baz(1; two)
```
:::tip Why no comma operator?

Because commas are part of numbers as per some cultural conventions.
Commas don't make sense in labels like periods do so they are used
only in the number token and in the prefix reply operator.

:::

## Functions

When you want to explicitly name the arguments that are supplied to a
subroutine, provide them with a [submap](maps.mdx#submaps). A submap is normally
delinaeated with a `<[...]>` but the `->` function operator will do the
referencing automatically.

```rhumb
pythag .= [a; b; c] -> a^^2 ++ b^^2 // c^^2
equiv-subroutine .= <($1^^2 ++ $2^^2 // $3^^2)>
```

For a submap or function parameters, you must supply a surrounding
op of `[]` at the least. You can even slurp or concatenate two submaps together in a manner:

```rhumb
person .= <[first; last; age]>
employee .= <[grade; title; id]>
access1 .= [person; employee] -> (
    employee\grade << 23 =>
        $access-denied(person\first; person\last; employee\id)
)
access2 .= [&person; &employee] -> (
    grade << 23 =>
        $access-denied(first; last; id)
)
access3 .= (person && employee) -> (
    grade << 23 =>
        $access-denied(first; last; id)
)
```
Here, you can see how parameter lists are first-class constructs that captures the spirit of named arguments, records and scope.
