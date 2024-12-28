## Why?
Types are nice I guess.

## How?
I am going to be using rust, but you can do this in any language that has recursion, probably.

To be fair, this really is just a small subset of [Purdue's CS 456 - Programming Languages](https://www.cs.purdue.edu/homes/bendy/cs456/spring24/).
We wrote multiple tiny interpreters in this class and a small type checker in Haskell among other things. 

I had also been working on an interpreted, [dynamic language](https://github.com/hydrophobefireman/lox) (essentially a rust version of the language created in [Crafting Interpreters](https://craftinginterpreters.com/)), So I decided to write another one, but this time with types.

## The Language
I haven't really thought much about the language. One one hand it would be very easy to make a language that is essentially a language that looks like [STLC](https://en.wikipedia.org/wiki/Simply_typed_lambda_calculus)  with additional types.   Life is easier when everything is an expression, write a simple parser, chose an [evaluation strategy](https://en.wikipedia.org/wiki/Evaluation_strategy), a type checker and an interpreter. Hell we don't even need a lot of data types, functions are all you need for a Turing complete language. 
I would also like the ergonomics of pattern matching, if else statements, while\[/for loops], etc.
Really, the goal for this language /and for a part of my summer  is to be able to solve leetcode style problems with it, including IO operations. 

## The Syntax
I am thinking as I type this but maybe something like:
```rust
let x: int = 0; // or let x = 0; once we have type inference

let y: int->int = (a => a + 1);

type Fn = int->int
let z: Fn = x=> {
	return match x {
		0=>0,
		num => num - 1
	};
}
let a: Fn = x=> {
	return if x == 0 {
		0
	} else {
		a(x-1)
	}
}
enum Bool {
	True,
	False
}
struct Point {
	x: int
	y: int
	distance_from_origin: Fn
} 

// y("test") // should give a type error
```
Things to note
- functions are first class values and creating a function is the same as creating a variable. 
- types, type aliases, ADTs
- I don't know how I will implement this
- I am tempted to make every variable mutable, but I am sure that would severely limit the number of usable programs possible in this language.


I will try to make this a follow along blog post in the style of crafting interpreters.

Let's start our project. 
