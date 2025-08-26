import { test, expect, describe } from "bun:test"
import { Result, resultPass } from "@/error"
import { Token } from "@/hxqa/types"
import { lex, lex as lexHxqa } from "@/hxqa/lexer"

type RandomBetween = (min: number, max: number) => number

const randomBetween: RandomBetween = (min, max) =>
    min < max ? Math.round((Math.random() * (max - min)) + min) : -1

describe("test hxqa lexer", () => {
    test("empty input", () => {
        const hxqa = ""
        const tokens = lexHxqa(hxqa).out()
        expect(tokens).toBeEmpty()
    })
    test("single line space only input", () => {
        const hxqa = " ".repeat(randomBetween(1, 10))
        const tokens = lexHxqa(hxqa).out()
        expect(tokens).toBeEmpty()
    })
    test("multi line empty input", () => {
        const hxqa = "\n".repeat(randomBetween(5, 20))
        const tokens = lexHxqa(hxqa).out()
        expect(tokens).toBeEmpty()
    })
    test("multi line space only input", () => {
        const hxqa = "\n"
            .repeat(randomBetween(5, 20))
            .split("\n")
            .map(_ => " ".repeat(randomBetween(1, 10)))
            .join("\n")
        const tokens = lexHxqa(hxqa).out()
        expect(tokens).toBeEmpty()
    })
})