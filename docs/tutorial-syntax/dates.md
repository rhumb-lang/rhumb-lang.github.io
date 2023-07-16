---
sidebar_position: 7
---

# Dates

Rhumb has a literal type for dates.

```rhumb
bd .= 12/25/2001
```

You can even use interpolation:

```rhumb
mship := donation +/ 100
renewal-date := 4/1/$mship
```

These date values work with most of the usual mathematical and logical operators. They also offer a set of bound functions that make
using and consuming them feature-complete.