# HXQA

Human readable and eXtendable Question Answer pairs format

A simple, clear, and user-friendly format which can be compile to jsonl for AI fine-tuning usage, free you from contacting with jsonl directly

# Basic Syntax

```hxqa
/// this is a comment that will be ignored by the compiler
::: a short system prompt
<<<a short input with no space before identifier
>>>

a long and multi-line output
balabala
...

/// new-line before and after content will also be ignored
<<<
another long but single-line input
>>> a short output

:::
/// another conversation with no system prompt
<<< hi there
>>> hello hxqa
```
