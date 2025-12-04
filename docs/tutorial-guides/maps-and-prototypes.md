---
sidebar_position: 1
---

# Maps & Prototypes

Rhumb follows a prototype-based object-oriented programming model, similar to the Self programming language or JavaScript. In Rhumb, the fundamental object is the **Map**.

## Maps as Objects

A Map is a collection of **fields** (key-value pairs) and **positional elements** (list items). Maps serve as both data structures and objects.

```rhumb
% A simple map acting as an object
point .= [
    x :: 10
    y :: 20
    
    % A method using the base operator '!' to access self
    print .. [] !> console\log("Point: $(!\x), $(!\y)")
]

point\print % Output: Point: 10, 20
```

## Shorthand Syntax

Inside a map literal, the `.` and `:` prefix operators serve as shorthand for assigning variables to fields of the same name.

*   **Immutable (`.`)**: `[.foo]` is equivalent to `[foo..foo]`. It assigns the variable `foo` to the field `foo` immutably.
*   **Mutable (`:`)**: `[:foo]` is equivalent to `[foo::foo]`. It assigns the variable `foo` to the field `foo` mutably.

This shorthand works for subfields as well. For example, `[.@bar]` is equivalent to `[@bar..bar]`.

:::info Context Matters
Outside of a map literal, these prefix operators have different meanings:
*   **`.`** freezes a value (Make Immutable).
*   **`:`** creates a copy of a value (Clone).
:::

## Slots and Lookup

In Rhumb, fields act as slots. When you access a field on a map (e.g., `my-map\some-field`), Rhumb performs a lookup:

1.  **Local Lookup**: It checks if `my-map` contains a field named `some-field`.
2.  **Delegation (Inheritance)**: If the field is not found, Rhumb looks into the map's **subfields** (prototypes).

### Subfields (Prototypes)

Subfields are special fields in a map that act as parents or prototypes. If a slot isn't found in the map, the lookup continues in these subfields. You can define a subfield using the `@` prefix.

```rhumb
% The prototype
vehicle .= [
    type :: 'Generic Vehicle'
    describe .. [] !> console\log("This is a $(!\type)")
]

% The child map inheriting from vehicle
car .= [
    % .@vehicle syntax adds 'vehicle' as a subfield/prototype
    .@vehicle
    
    % Overriding a field
    type :: 'Car'
]

car\describe % Output: This is a Car
```

In this example:
1. `car\describe` is called.
2. Rhumb looks for `describe` in `car`. It's not found.
3. Rhumb checks the subfield `vehicle`. `describe` is found there.
4. The function is executed. Crucially, the base (`!`) remains bound to `car`, so `!\type` resolves to `'Car'`.

## The Base (`!`)

When a function is defined with the `!>` operator (Bound Function), it acts as a method. Inside the function, the `!` operator gives you access to the **base** map (the receiver of the message). This is equivalent to `self` or `this` in other languages.

```rhumb
counter .= [
    count :: 0
    increment .. [] !> !\count := !\count ++ 1
]

counter\increment
console\log(counter\count) % 1
```

## Implicit Base Return

If a subroutine accesses the base (`!`), it will automatically return the base upon completion, unless a signal (`#`) is explicitly sent.

```rhumb
% '!' is accessed, so it is returned implicitly
set-a .= [val] -> (
  !\a := val
  % #(!) is not needed, already default behavior
)

% Explicit signal overrides implicit return
set-b .= [val] -> (
  !\b := val
  #(val) % Return 'val' instead of '!'
)
```

## Multiple Inheritance (Traits)

Since a map can have multiple subfields, Rhumb supports multiple inheritance (or traits).

```rhumb
identifiable .= [
    id :: '12345'
    get-id .. [] !> !\id
]

namable .= [
    name :: 'Unknown'
    get-name .. [] !> !\name
]

% Inherit from both
user .= [
    .@identifiable
    .@namable
    name :: 'Alice'
]

console\log(user\get-name) % Alice
console\log(user\get-id)   % 12345
```

## Accessing Subfields Directly

Sometimes you want to bypass the standard lookup or access a specific prototype directly (like `super` calls).

*   **`@` Operator**: Access a specific named subfield.
    ```rhumb
    child@parent\some-method
    ```

*   **`[@]` Operator**: Access all subfields as a single map.
    ```rhumb
    child[@]\some-method
    ```

## Methods vs Functions

*   **`->` (Function)**: A standard function. Does not bind `!`. Useful for pure logic or callbacks where context doesn't matter.
*   **`!>` (Bound Function/Method)**: Binds `!` to the object it was called on. Essential for object behavior.

## Dynamic Dispatch

Because maps are dynamic, you can add or change behavior at runtime.

```rhumb
robot .= [ .@vehicle ]
robot\type := 'Robot'

% Add a new method dynamically
robot\say-hello := [] !> console\log("Beep boop")

robot\say-hello
```

## Manual Binding (`!!`)

You can manually bind a function to a specific object using the `!!` operator. This is useful for reusing functions across different objects without inheritance or when you want to execute a standalone function within a specific context.

```rhumb
identify .= [] -> !\name\upper-case
speak .= [] -> (
  greeting .= "Hello, I'm $identify"
  console\log(greeting)
)

me .= [ name .. 'Jake' ]
you .= [ name .. 'Reader' ]

(<identify> !! me)() %= 'JAKE'
(<identify> !! you)() %= 'READER'

(<speak> !! me)() %= "Hello, I'm JAKE"
(<speak> !! you)() %= "Hello, I'm READER"
```

## Summary

*   **Maps** are the sole object type.
*   **Fields** hold state or behavior.
*   **Subfields (`@`)** allow delegation (inheritance).
*   **`!`** accesses the current object (self).
*   **`!>`** defines methods that bind `!`.