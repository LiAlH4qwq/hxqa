import { describe, test, expect } from "bun:test";
import { resultPass, resultSolid } from "@/error";
import { analyze } from "@/analyzer";
import { lex as lexHxqa } from "@/hxqa/lexer";
import { parse as parseHxqa } from "@/hxqa/parser";
import { lex as lexJsonl } from "@/jsonl/lexer";
import { parse as parseJsonl } from "@/jsonl/parser";
import { generate as generateHxqa } from "@/hxqa/generator";
import { generate as generateJsonl } from "@/jsonl/generator";

describe("test hxqa to jsonl", () => {
    test("", () => {
        const hxqa = `
::: Your are a helpful assistant.
<<< Who are you?
>>> I'm an assistant.
        `
        const result = resultPass(hxqa)
            .then(lexHxqa)
            .then(parseHxqa)
            .then(analyze)
            .then(generateJsonl)
        const solidResult = resultSolid(result)
        const expected = {
            pass: true,
            value: `{"messages":[{"role":"system","content":"Your are a helpful assistant."},{"role":"user","content":"Who are you?"},{"role":"assistant","content":"I'm an assistant."}]}`
        } as const
        expect(solidResult).toStrictEqual(expected)
    })
})

describe("test jsonl to hxqa", () => {
    test("", () => {
        const jsonl = `{"messages":[{"role":"system","content":"Your are a helpful assistant."},{"role":"user","content":"Who are you?"},{"role":"assistant","content":"I'm an assistant."}]}`
        const result = resultPass(jsonl)
            .then(lexJsonl)
            .then(parseJsonl)
            .then(analyze)
            .then(generateHxqa)
        const solidResult = resultSolid(result)
        const expected = {
            pass: true,
            value: `:::
Your are a helpful assistant.

<<<
Who are you?

>>>
I'm an assistant.
`
        } as const
        expect(solidResult).toStrictEqual(expected)
    })
})