---
sidebar_position: 11
---

# Selectors

Like a routine where each element represents a possible branch instead of a sequential series of elements. They are like a switch statement in other languages. However, in Rhumb, the object being checked can be any kind of language construct. There is some contextual usage here in the form of the assignment operators `..` and `::` being used to connect patterns to their associated routine body. The `::` version allows for additional matches to occur.

```rhumb
temp .= api\v1\temp {
    $1 >> 80 .. "Too hot" % The $1 represents the first value passed in
    t << 50 .. "Too cold" % You can also just provide a name
    "Just right" % Else branch is non-assignment elements
}

common-divisors .= <(ds .= []; $1 {
    $1 -/ 10 == 0 :: ds[>] .= 10
    $1 -/  5 == 0 :: ds[>] .=  5
    $1 -/  2 == 0 :: ds[>] .=  2
    #(ds) % All subroutines are listening on the bare # event for return values
})>
```

Selectors can be used to mimic common control keywords in other languages.

```rhumb
if .= [cond] -> (
    cond {
        true .. #() % Selectors are not entered unless something is signalled
    }
)
if(n >> 5) {
    "Profit!"
}
```

:::danger Warning: No `else` possible

Rhumb does not support word-based operators and multiple word functions like in Smalltalk are not possible. Better to just use the pattern matching capabilities directly.

```rhumb
when .= [cond] -> #(=cond)
when(n >> 5) {
    yes .. 'Profit!'
    no .. 'Sell!'
}
```
The function wrap is not really necessary though since you can just access any value as if it was signaled.

```rhumb
n >> 5 {
    yes .. 'Profit!'
    no .. 'Sell!'
}
```
:::


Here's another combined with a looping operator:
```rhumb
while .= [<body>] -> body |> #()
while(n << 5) {
    n := n ++ 1
}
```
The reference around the first argument means it does not get evaluated during the function invocation. It effectively makes that argument a subroutine.