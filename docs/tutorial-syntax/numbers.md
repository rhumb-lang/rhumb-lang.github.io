---
sidebar_position: 2
---

# Numbers

Numbers can be written in a wide variety of ways to support as many different syntaxes as possible.

```plain
10
10.0
10,2
10.-
10,-
10.000,00
10.000,-
10,000.-USD
```

You can use either the `.` or the `,` to indicate either the thousand-separator or the decimal place. Additionally, you can supply a currency code after the number and Rhumb will actually generate a Currency value.

:::tip No significant decimal value

You can specify that a number is only significant to the ones place by ending the number in `.-` instead of a usual number.

:::

## Rational Numbers

Numbers with any kind of decimal place (be it `.` or `,`) are called rational numbers. The value after the decimal place can be considered a ratio of the number value over 10 times the number of digits of the number. In other languages, these kinds of numbers are known as decimals or floats.


:::tip Significant Digits

 The number of digits after the decimal point is also called the "significant digits" and in Rhumb this is stored so that any number that is combined in any way with another number has the highest significant digit maintained in the resulting value.

:::

## Whole Numbers

Numbers without a decimal palce are called whole numbers. In other languages they are known as integers.

:::warning Mixed Math

When you mix whole and rational numbers, you are always left with a rational number. You must explicitly convert a value back to a whole number.
:::
