# HXQA

A Library converts between HXQA, a human-writable format, and jsonl.

## NOTICE

This is a Bun-only library that can only be used with Bun!

## Introduction to HXQA Format

HXQA, means Human-writable eXtendable Question-Answer format,
 corresponding to it's name, is a human-writable format
 that compiles to jsonl, let you write ai finetuning dataset easier.

### HXQA Syntax

```hxqa
::: This is a conversation start identifier, and this sentence is system prompt.
<<< This is a input identifier, and this sentence will be assistant message of jsonl.
>>> This is a output identifier, and this sentence will be user message of jsonl
/// This is a comment identifier, will be ignore by the compiler
<<<
The identifier and the text can be on different line.
>>>
And input-output statements must occurs in turn.
/// Next line starts a new conversation, without system prompt
:::
<<<
All Text can be multi-line
like this.
>>>
Every line will be trimmed
and the entire text in statement will be trimmed too 
```

## Basic Usage

HXQA -> jsonl

```typescript
import { compile } from "hxqa"
const hxqa = `
::: Your are a helpful assistant.
<<< Hi!
>>> Hi there!
`
const result = compile(hxqa)
if (result.pass) console.log(result.value)
else console.log(result.error)
```

jsonl -> HXQA

```typescript
import { decompile } from "hxqa"
const json = {
    messages: [
        {
            role: "system",
            content: "You are a helpful assistant"
        },
        {
            role: "user",
            content: "Hi!"
        },
        {
            role: "assistant",
            content: "Hi there!"
        }
    ]
}
const jsonl = JSON.stringify(json)
const result = decompile(jsonl)
if (result.pass) console.log(result.value)
else console.log(result.error)
```
