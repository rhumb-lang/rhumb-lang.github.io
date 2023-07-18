---
sidebar_position: 8
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

:::info Note: Map References

Maps are always references so for a map labeled `m`, the expression `m` and `<m>` are equivalent. 

This operator allows you to sever the reference by creating a clone of the corresponding map and then the expression evaluates to a reference to that new cloned map.

```rhumb
link .= [some-map, val] -> some-map\foo .= val
baz .= []
link(baz; 'wow') % baz == [foo..'wow']
link(baz[:]; 'BAZ IS BROKEN!') % original baz is unchanged
```
Since the copied `baz` map is never stored anywhere, it will soon be garbage collected.

:::

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

Some of the field operators have a shorthand prefix version. These versions usually lean closer to what users expect coming from other languages.

### `?` Empty?

See [field op](#-empty) description.

```rhumb
has-bananas .= ?warehouse\banana => warehouse\banana >> 0
```

### `.` Freeze

See [field op](#-freeze) description.

```rhumb
vote.final .= [v] -> (
    votes[>] .= v
    #(.votes)
)
```

### `:` Copy

See [field op](#-copy) description.

The `NewWarehouse` subroutine stores the first arg in `pos` field.

```rhumb
wh2 .= NewWarehouse(:positions; 'Oak') 
wh2\pos\manager := Employee('Sandra'; 1734521)
wh3 .= NewWarehouse(:positions; 'Maple')
wh3\pos\manager := Employee('Darius'; 4827142)
```

The original `positions` map is unchanged.

```rhumb
wh4 .= NewWarehouse(wh3\pos; 'Cherry')
```

Now, `wh4` shares positions with `wh3` and changes are applied to both maps.

### `+` Numerical Coerce

See [field op](#-numerical-coerce) description.

```rhumb
unix-time .= +07/16/2023
```

### `-` Numerical Negate

See [field op](#--numerical-negate) description.

```rhumb
flipped .= -num
```

### `=` Logical Coerce

See [field op](#-logical-coerce) description.

```rhumb
foo := =bar => 'bar is true' ~> 'bar is false'
```

### `~` Logical Negate

See [field op](#-logical-negate) description.

```rhumb
toggle .= [] -> state := ~state
```

### `&` Slurp / Spread

See [field op](#-slurp--spread) description.

```rhumb
first .= [it; &rest] -> #(it)
```

## Special Prefix Operators

Some of the field operators don't have a corresponding prefix version. This is because there already exists a prefix syntax for a different purpose. Each of these concepts requires some name or value and thus would not work as a field operator.

### `$` Argument Access

Inside of subroutines, you have rudimentary access to a parameter list that is automatically created for you when you use the argument operator. This allows you to specify quick succinct subroutines without needing to use explicitly named parameter labels.

```rhumb
inc .= <($1 ++ 1)> % $1 is the first argument
print .= <(console\log(&$0))> % $0 is all arguments
```

### `#` Signal Outward

You can send events outward into any active selector by using the `#` signal operator. You can either specify a label for the signal or leave it anonymous. Anonymous signals are used for returning values out of subroutines if you don't want to wait for the final expression or if you have used a `!` base expression. 

```rhumb
User .= [name; age] -> (
    !\name := name
    !\dob := Date\now\year -- age
    !\req-count := 0
)
<User>\request .= [amount] !> (
    !\req-count := !\req-count ++ 1
    result .= System\request(amount)
    console\log(result)
    #(result)
)
```

Anonymous signals will trigger the nearest active selector with a default section. You can implement historical programming idioms with this system.

```rhumb
if .= cond -> =cond => #()  
if(foo == yes) {
    console\log("foo is true")
}

switch .= cond -> #(cond) 
switch(getchar) {
    'a' .. console\log("got a!")
    'b' .. console\log("got b!")
    unknown .. console\log("unknown value: $unknown")
}
```

### `^` Signal Inward

You can send results inward from a previously sent event signal. This allows you to process something in the capturing selector and then return the result or a decision back inward.

```rhumb
chat-client .= [creds] -> (
  client .= Client(creds) {
    #ConnError(code) .. (
      retry .= #ConnError(code)
      retry => client\reconnect
    )
  }
)

main .= [] -> (
  chat-client(config\credentials) {
    #ConnError(code) .. code == 403 => ^(yes)
  }
)
```

Additionally, you could attach a selector to the outward signal and then specify different named replies to give you additional flexibility.

```rhumb
chat-client .= [creds] -> (
  client .= Client(creds) {
    % if ConnError, send outward, check for replies
    #ConnError(code) .. $ConnError(code) {
        ^reconnect .. client\reconnect
        ^cancel .. client\cancel
    }
  }
)

main .= [] -> (
  chat-client(config\credentials) {
    #ConnError(code) .. code {
        403 .. ^reconnect
        500 .. ^cancel
    }
  }
)
```

### `.` `:` Destructuring Operators

To make it easier to write destructuring assignment expressions, there is a handy shorthand when the label being assigned is the same as the label being destructured.

```rhumb
foo .= [
    bar :: 10
    qux :: 'ten'
]
[.bar; :qux] .= foo % now bar and qux are free labels in scope.
% qux is again mutable but this scoped bar is immutable now.
```

### `` ` `` Key Literal

Creating keys with ``[`]`` is useful for dynamically generating keys. When you know the key name, use a key literal.

```rhumb
project.key := 'MyAwesomeApp'[`] % needlessly verbose
project.key .= `MyAwesomeApp
```

## Chaining Operators

There are a select few operators that work with single character sigils. These are for navigating inner map fields.

### `\` Inner Field

Use this operator to get into a map's fields. You can nest these as many times as needed to get to deeper fields.

```rhumb
foo .= [
    bar .. [
        baz .. [
            qux .. 'WOW!'
        ]
    ]
]
foo\bar\baz\qux == 'WOW!' % yes
```

You can use this operator with numbers too when you need to get into positional elements.

```rhumb
foo .= [
    bar .. [
        [
            qux .. 'WOW!'
        ]
    ]
]
foo\bar\1\qux == 'WOW!' % yes
```

### `@` Inner Subfield

Use this operator to directly access a subfield that a map contains.

```rhumb
foo .= [
    @value .. [
        usage :: 0
        value :: empty
        get .. [] !> (
            !\usage := !\usage ++ 1
            #(!\value)
        )
        set .. [v] !> (
            !\usage := !\usage ++ 1
            #(!\value := v)
        )
    ]
]
foo\set(21)       % foo[@... [usage :: 1; value :: 21]]
foo\get           % foo[@... [usage :: 2; value :: 21]]
foo@value\set(32) % foo[@... [usage :: 3; value :: 32]]
foo\get           % foo[@... [usage :: 4; value :: 32]]
```

### `*` `**` Globbing

You can return a list of fields by using the glob operators.

```rhumb
foo .. [
    bar .. 1
    baz .. 2
]
foo\* % ['bar'; 'baz']
```

Better yet, you can run expressions against them and each matching field will be supplied as a copy of the expression.

```rhumb
foo .. [
    bar .. yes
    baz .. no
    qux .. 2
]
foo\* == yes % [yes; no; no]
```
You can even place the `*` wildcard operator inside of a partial label and it will attempt to find any matching labels.

```rhumb
foo .. [
    red.code  .. '#FF0000'
    red.rgb   .. RGB(255;0;0)
    cyan.code .. '#00FFFF'
    cyan.rgb  .. RGB(0;255;255)
    blue.code .. '#0000FF'
    blue.rgb  .. RGB(0;0;255)
]
foo\*.code -> foo\$0 % ['#FF0000'; '#00FFFF'; '#0000FF']
```

If you have an arbitrarily nested map, you can use the `\\` binary operator coupled with the wildcard operator to get an even larger search pattern.

```rhumb
foo .. [
    bar .. [
        bar.value .. 10
    ]
    baz .. [
        qux .. [
            qux.value .. 20
        ]
    ]
]
foo\\*.value -> foo\\$0 % [10; 20]
```

## Infix Operators

Operators that work on two values on either side are called infix operators. 

### `.=` Assignment, Immutable

The left-hand side is converted to a reference if not already one. The right-hand side is evaluated and the result is placed in the label reference location from the left-hand side. The label value is not able to be changed; it is automatically frozen upon assignment.

### `:=` Assignment, Mutable

The left-hand side is converted to a reference if not already one. The right-hand side is evaluated and the result is placed in the label reference location from the left-hand side. The label value is able to be changed; it can be frozen later using the `[.]` field operator.

### `^=` Assignment, Destructuring

The right-hand side must be a map. The left-hand side is uniquely parsed to have all the identified field or element locations assigned to a corresponding label name in the current lexical scope. It can also be assigned to fields and elements as well.

```rhumb
% positional
[1..a;2..b] ^= map
[1..a;3..b] ^= map
[1..a??default;2..b] ^= map
[1..a;2..b;&rest] ^= map
[1..a;3..b;&rest] ^= map
[1..a;2..b;&[.pop;.push]] ^= map % pop & push bound to map of rest
[1..a;2..b;&[1..c;2..c]] ^= map

% nominal
[.a;.b] ^= map
[a..a1;b..b1] ^= map
[a..a1??default;b..b??default] ^= map
[.a;.b;&rest]^=map
[a..a1;b..b1;&rest]^=map
[<key>..a]^=obj
```

See [Map Destructuring] for more info.

### `++` Addition

Both sides are coerced into numeric values and then the second value is added to the first value and the result is returned.

### `--` Subtraction

Both sides are coerced into numeric values and then the second value is subtracted from the first value and the result is returned.

### `**` Multiplication

Both sides are coerced into numeric values and then the first value is multiplied by the second value and the result is returned.

### `^^` Exponent

Both sides are coerced into numeric values and then the first value is taken to the power of the second value and the result is returned.

### `//` Decimal Division

Both sides are coerced into numeric values and then the first value is divided by the second value and the result is returned. The result is always in rational (decimal) notation.

### `+/` Integer Division

Both sides are coerced into numeric values and then the first value is divided by the second value and the result is returned. The result is always rounded to the floor integer and then returned as a whole number.

### `-/` Remainder

Both sides are coerced into numeric values and then the first value is divided by the second value and the remainder is returned. The result is always a whole number.

### `*^` Scientific Notation

Both sides are coerced into numeric values and then the first value is multiplied by the ten and taken to the power of the second value and the result is returned.

### `^/` Root / Radication

Both sides are coerced into numeric values and then the second value is taken to the root of the first value and the result is returned.

### `==` Equality

The left-hand side value's equality function is evaluated, if available. Otherwise, maps are checked for identity equality.

### `~~` Inequality

The left-hand side value's equality function is evaluated and negated, if available. Otherwise, maps are checked for identity equality and the negation returned.

### `=@` Has Subfield

The left-hand side is checked to see if it has a subfield that is equal to the map on the right-hand side. If a text is provided, the check is to see if there exists a subfield with a corresponding label that equals the text value.

### `~@` Doesn't have subfield

The left-hand side is checked to see if it does not have a subfield that is equal to the map on the right-hand side. If a text is provided, the check is to see if there does not exist a subfield with a corresponding label that equals the text value.

### `=\` Has Field

The left-hand side is checked to see if it has a field that is equal to the map on the right-hand side. If a text is provided, the check is to see if there exists a field with a corresponding label that equals the text value.

### `~\` Doesn't Have Field

The left-hand side is checked to see if it does not have a field that is equal to the map on the right-hand side. If a text is provided, the check is to see if there does not exist a field with a corresponding label that equals the text value.

### `>>` Greater Than

Both sides are coerced into numeric values and then a comparison is performed to determine if the first value is greater than the second. If so, then the result is `yes`, else the result is `no`.

### `<<` Less Than

Both sides are coerced into numeric values and then a comparison is performed to determine if the first value is less than the second. If so, then the result is `yes`, else the result is `no`.

### `>=` Greater Than or Equal

Both sides are coerced into numeric values and then a comparison is performed to determine if the first value is greater than or equal to the second. If so, then the result is `yes`, else the result is `no`.

### `<=` Less Than or Equal

Both sides are coerced into numeric values and then a comparison is performed to determine if the first value is less than or equal to the second. If so, then the result is `yes`, else the result is `no`.

### `/\` Logical Conjunction

Both left and right sides are evaluated and converted to boolean values. If both sides evaluate to `yes`, then the result of the expression is `yes`. Otherwise, the result is `no`.

### `\/` Logical Disjunction

Both left and right sides are evaluated and converted to boolean values. If either side evaluate to `yes`, then the result of the expression is `yes`. Otherwise, the result is `no`.

### `=>` If True Then

If the left-hand side evaluates to `yes` then the right-hand side is evaluated. The result of the expression is the result of the right-hand side expression.

If the left-hand side evaluates to `no` then the right-hand side is never evaluated. The result of the expression is then `empty`.

### `~>` If False Then

If the left-hand side evaluates to `no` or `empty`, then the right-hand side is evaluated. The result of the expression is the result of the right-hand side expression.

If the left-hand side evaluates to anything else, then the right-hand side is never evaluated. The result of the expression is then the `empty`.

### `|>` While

The left-hand argument becomes a subroutine if not already provided as one. This subroutine is evaluated over and over again until it returns `no` or `empty`. Each time that the subroutine does not return those two possible values, it executes the right-hand side of the argument (also a subroutine).

### `<>` Foreach

The left-hand side must be a map and it takes the positional values and supplies them one-by-one to a subroutine on the right-hand side (or a function). The final result of the expression is a list of all of the returned results.

### `||` Pipe

Take the left-hand side and evaluate, the result is then given as arguments to the right-hand side (which is either an explicit subroutine or one is created implicitly from the expression given).

### `??` Default

If the left-hand side is empty, evaluate to the right-hand side, otherwise return the original left-hand side value.

### `!!` Bind

Take a function or subroutine and give it a different base value than it currently has. This operation is interlally occuring when you use the `!>` operator.

### `->` Make Function

When given a map or submap on the left, it is set to the parameter map of a subroutine. The subroutine is either one provided in the right-hand side of the expression or, the right-hand side is converted into a subroutine.

When given a wildcard expression on the left, the wildcard operation is setup as a submap where the wildcard operation is performed whenever the corresponding subroutine is evaluated and then the resulting matched field paths are provided as the arguments to the subroutine expression on the right.

### `!>` Bound Function

This is exactly like the `->` function operator, but it also sets the base `!` to be the same base as lexical location of the function. This way, the function becomes what many languages call a "method".

### `$>` Let Function (IIFE)


This is exactly like the `->` function operator, but it executes the corresponding function immediately (and also sets the base `!` to be the same base as the lexical location of the function) instead of storing the function for later usage.

### `@@` Temporary Subfield

Both sides of this operation are maps, the left is given a subfield with the label that matches the right's label. This is only active for the life of the expression but the user can assign it back to the corresponding label if permanance is desired.

### `&&` Concatenate

When used with maps, it combines the positional elements into one and creates a new map with those positional elements.

When used with text, it combines the text into one by joining them together in the order they are provided.

When used with selectors, it combines the selector paths into one when evaluating.

### `\\` Nested Access

When used with wildcard operator, this expands the search to any inner map structure as well.

When used with lists of strings, it parses the strings as paths and evaluates to the resulting inner location's value.