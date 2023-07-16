---
sidebar_position: 7
---

# Operators

Rhumb does much of the work of code within the operators. This is
how Rhumb is able to achieve zero human language requirements in the
core language.

## Field Operators

These operators are supplied within square brackets `[]` and they can be given to various kinds of labeled values. Some of them are not so dynamic and are only applicable to specific value types.

### `[>]` Append

Add an element to the positional values of a map and place it at
the end of the list.

```rhumb
toppings .= ['pepperoni']
toppings[>] .= 'bell peppers'
```

### `[<]` Unshift

Add an element to the positional values of a map and place it at
the beginning of the list, shifting all existing elements out.

```rhumb
fav-albums .= ['white album']
fav-albums[<] := 'revolver'
"my new favorite album is $(fav-albums[1]\title)"
```

### `[#]` Length

Get the length of the positional elements with `[#]`.

```rhumb
toppings[>] .= 'mushrooms'
cost := cost ++ (toppings[#] ** 0.35)
```

To get the total number of fields, you can use this length operator after using the All Fields `[*]` operator.

```rhumb
num-of-car-features .= car[*][#]
```

### `[?]` Empty?

Determine if a label is `empty`.

```rhumb
foo .= bar[?] => 'nothing' ~> bar
```

:::info Note: What is `empty`?

Any label not yet defined is considered `empty` by default. An `empty` value can also be provided to a label which is essentially a no-op but can be used to convert a previously filled label into an `empty` one.

A label that is `empty`, no longer has any references to it, and is no longer within scope, will be garbage collected.

:::

### `[@]` All Subfields

Take all of the subfields of this value and consider them a single map for subsequent operations to be performed against.

This operator is useful to skip over the fields within the base object that may override some underlying operation and you can then pass a label to one of the subfields instead. It allows you to perform this message passing *without actually knowing the subfield's label*.

```rhumb
foo .= [
    func .. [s] !> !\value := s
]
bar .= [
    .@foo
    value :: 'initial'
    func .. [s] !> !\value := "$(s)$(s)"
]
bar\func('ya') % bar\value == 'yaya'
bar@foo\func('ha') % bar\value == 'ha'
bar[@]\func('ja') % bar\value == 'ja'
```

### `[*]` All Fields

### `[0]` All Positional Elements

### `[.]` Freeze

### `[:]` Copy

### `[/]` Date Coerce

### `[$]` Function/Subroutine Parameters

### `[^]` Map Constructor

### `[!]` Function/Subroutine Base

### `[+]` Numerical Coerce

### `[-]` Numerical Negate

### `[=]` Logical Coerce

### `[~]` Logical Negate

### `[&]` Slurp / Spread

### ``[`]`` Key Coerce

## Prefix Versions

## Chaining Operators

## Binary Operators