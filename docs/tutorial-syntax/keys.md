---
sidebar_position: 5
---

# Keys

Distinct identity labels. Keys are special labels that can never match
any other value than itself.

```rhumb
foo .= `foo
`email@domain.com
```

They use ``` ` ``` as a prefix and any non-space codepoint after is
part of the key's label. They are first-class objects and can be
passed around with subroutines. Keys can even be used as map labels.

:::info What are they for?

They are useful for skipping string comparisons in some kinds of
programming patterns or hiding certain functionality to be only
accessible by someone with the key.

:::