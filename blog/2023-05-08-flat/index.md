---
slug: flat-go-generics
title: Flattening VM & Generic Troubles
authors: [madcapjake]
tags: [golang, vm, compiler]
---

So, after reading a few articles that inspired, I have started a branch on `rhi` 
that will be for no nan-boxing and just straight Go structs inside of a large array.
I am not playing with slices right now because I don't particularly like how they
can be attached to old backing array and I had some trouble with that in my previous
Go project.

Adrian Sampson's article [Flattening ASTs (and Other Compiler Data Structures)](https://www.cs.cornell.edu/~asampson/blog/flattening.html)
was a great read and reminded me that I often make problems bigger than they need
to be. I was chasing this ridiculous floating point NAN approach and didn't stop
to think about how that was slowing me down. 

<!--truncate-->

On my new branch, I now have object types and a working generator. I originally
tried to play with a doubly-nested set of interfaces so that the outer type represents
the Code type and the inner type represents the Object type. The problem is that
I was hitting an error with Golang's generics where interfaces can't be used for
derived types. Look at this [example](https://go.dev/play/p/VTRkqnrHMj8) in the Go Playground.

```
./prog.go:45:24: cannot use red (variable of type RedCar[Dynamite]) as TrainCar[Loadable] value in argument to append: RedCar[Dynamite] does not implement TrainCar[Loadable] (wrong type for method GetTarget)
		have GetTarget() Dynamite
		want GetTarget() Loadable
./prog.go:45:29: cannot use blue (variable of type BlueCar[Passengers]) as TrainCar[Loadable] value in argument to append: BlueCar[Passengers] does not implement TrainCar[Loadable] (wrong type for method GetTarget)
		have GetTarget() Passengers
		want GetTarget() Loadable
```

Because of this, I had to do a small rewrite (smaller than I anticipated) and now
it is satisfing all errors and prints the code and value to the console.

There is a ton more to do just for feature parity with the old but I am making
much faster proces thjan previously.
