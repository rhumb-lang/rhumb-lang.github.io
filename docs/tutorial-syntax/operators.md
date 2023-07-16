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

Take all the field labels and return them as a positional list of texts. This allows you to use a map's fields dynamically.

```rhumb
warehouse .= [
    bananas :: 10
    blueberries :: 500
]
warehouse\cherries := 30
warehouse[*] <> fruit -> add-to-truck(fruit, warehouse[fruit])
```

### `[0]` All Positional Elements

Take all the positional elements and return them as a simple map without any of the original map's fields attached. This allows you to take some positional data and excise it from one map and place it into a new or different one.

```rhumb
g := Guest('Jake'; 0; 7/16/2023)
u := User(paying..yes; g[0])
```

### `[.]` Freeze

If an expression resolves to a mutable value, convert from mutable to immutable permanently. You cannot reverse this operation.

To freeze a label, provide it as a reference.

### `[:]` Copy

Take a copy of an evaluated expression. The mutability type is converted to mutable on the copy but can be frozen again with the `[.]` field op.

```rhumb
foo .= ['a'; 10; 1/1/2023]
bar .= <foo> % bar now refers to the same map as foo
bar[2] := 30 % foo == ['a'; 30; 1/1/2023]
baz .= foo % this is an implicit copy
baz[2] := 99 % foo == ['a'; 30; 1/1/2023]
inc2 .= x -> (x[2] := x[2] ++ 1; #(x))
qux1 .= inc2(foo) % inc2 modifies foo
qux2 .= inc2(foo[:]) % foo is now explicitly copied
% original foo is unmodified
```

### `[/]` Date Coerce

Can be applied to a number to try to convert from Unix time into a date and also can convert a text by applying several parsing strategies to see if it qualifies as a date.

### `[$]` Function/Subroutine Parameters

When applied to a function or subroutine, it returns the submap that was either supplied to the function operator or it returns the generated submap that represents the numbered arguments within a subroutine.

### `[^]` Map Constructor

When applied to a map, it returns the function or subroutine that was used to initially generate the map.

### `[!]` Function/Subroutine Base

When applied to a function or subroutine, it returns the map that is bound as the base of the subroutine. All subroutines are initially given a fresh map but using the `!>` applicative operator or `!!` binding operator allows you to change a base map.

### `[+]` Numerical Coerce

When applied to any value, it attempts to execute the corresponding coercion function into a number for that value. Maps can supply their own implementation of number coercion as well.

### `[-]` Numerical Negate

When applied to any value, it first attempts the numerical coercion and then flips the sign of the resulting number value.

### `[=]` Logical Coerce

When applied to any value, it attempts to execute the corresponding coercion function into a truth for that value. Maps can supply their own implementation of truth coercion as well.

### `[~]` Logical Negate

When applied to any value, it first attempts the truth coercion and then flips the kind of the resulting truth value.

### `[&]` Slurp / Spread

When applied to a map, it takes the inner positional elements and slips them into the outer scope as positional elements. When applied to a parameter name in submap, it greedily takes the surrounding positional arguments that don't have a corresponding parameter name. It works at the beginning, middle or end of a submap which allows for maximum slurping power.

### ``[`]`` Key Coerce

When applied to any value, it attempts to execute the corresponding coercion function into a key for that value. Maps can supply their own implementation of key coercion as well.

## Prefix Versions

### `?` Empty?

### `.` Freeze

### `:` Copy

### `+` Numerical Coerce

### `-` Numerical Negate

### `=` Logical Coerce

### `~` Logical Negate

### `&` Slurp / Spread

## Special Prefix Operators

### `$` Argument Access

### `#` Event Signal

### `^` Event Reply

### `.` `:` Destructuring Operators

### `` ` `` Key Literal


## Chaining Operators

### `\` Inner Field

### `@` Inner Subfield

### `*` `**` Globbing

## Binary Operators

### `++` Addition

### `--` Subtraction

### `**` Multiplication

### `^^` Exponent

### `//` Decimal Division

### `+/` Integer Division

### `-/` Remainder

### `*^` Scientific Notation

### `^/` Root / Radication

### `==` Equality

### `~~` Inequality

### `=@` Has Subfield

### `~@` Doesn't have subfield

### `=!` Is Bound To

### `~!` Isn't Bound To

### `=\` Has Field

### `~\` Doesn't Have Field

### `>>` Greater Than

### `<<` Less Than

### `>=` Greater Than or Equal

### `<=` Less Than or Equal

### `/\` Logical Conjunction

### `\/` Logical Disjunction

### `=>` If True Then

### `~>` If False Then

### `||` Pipe

### `??` Default

### `!!` Bind

### `->` Make Function

### `!>` Bound Function

### `$>` Let Function (IIFE)

### `@@` Temporary Subfield

### `&&` Concatenate

### `##` Catch With