# HXQA

A Library converts a human-writable format to jsonl.

## Basic Usage

```javascript
import * as hxqa from "hxqa"
const hxqa = `
::: Your are a helpful assistant.
<<< Should I use typescript for my project?
>>> Yes.
`
const result = hxqa.compile(hxqa)
console.log(result)
```

## Output Structure

### Compile Success

```typescript
{
    pass: true
    value: string
}
```

## Compile Failed

```typescript
{
    pass: false
    error: {
        stage: "ParsingError"
        type: "NoTokens"
    } | ({
        stage: "ParsingError"
    } & ({
        type: "MissingFollowingToken"
        details: "NoTextAfterInputOrOutput"
    } | {
        type: "UnexpectedTokens"
        details: "TextBeforeIdentifiers"
    }) | {
        stage: "AnalyzingError"
    } | & ({
        type: "UnexpectedStatements"
        details: "QuestionOrAnswerBeforeConversation" | "ExpectedInputButGetOutput"
    } | {
        type: "MissingFollowingStatements"
        details: "ConversationMissingQuestionAnswerPairs" | "QuestionMissingAnswer"
    })) & {
        mappingInfo: {
            lineStart: number
            lineEnd: number
            columnStart: number
            columnEnd: number
        }
    }
}
```

## HXQA Format

Human readable and eXtendable Question Answer pairs format

A simple, clear, and user-friendly format which can be compile to jsonl for AI fine-tuning usage, free you from contacting with jsonl directly

### Basic Syntax

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
