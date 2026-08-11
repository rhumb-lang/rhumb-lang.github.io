---
sidebar_position: 1
---

# What is Rhumb?

Rhumb is a dynamically-typed reactive multi-paradigm programming language inspired by Self and JavaScript
incorporating the **Syndicated Actors** model and **Algebraic Effect** handlers. It has its own take on objects, message passing, and tuplespaces.

## Getting Started

Rhumb is a work in progress. You can get a copy of the source code by cloning [this](https://github.com/rhumb-lang/rhodin) repository.

To learn about how the language works, read about the [Syntax](category/tutorial---syntax) and check the [Guides](category/tutorial---guides). The **Reference** section covers [functions](category/reference---functions) and [maps](category/reference---maps).

## Design Philosophy

Rhumb is designed to be exotic compared to traditional programming language concepts. There will be some familiar territory in that the language is still largely structured like an ALGOL-style procedural language but there are no statements, only expressions. Furthermore, objects are not created through classes but using a hidden class called a Legend. This is behind the scenes from the programmer. They interact with objects by cloning or using subroutine constructors. This is called a Prototype based object system. The twist is that these objects can have multiple parents, which creates a DAG-structured object system. Additionally, the language incorporates the Syndicated Actors model through tuplespaces called "Realms" and effect handlers called "Selectors". All of the statement and keyword based functionality of a traditional programming language is instead covered by operators and expressions.
