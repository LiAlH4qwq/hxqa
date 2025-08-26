import { SolidResult, resultPass, resultSolid } from "@/error"
import { CompilingError, AST } from "@/types"
import { analyze } from "@/analyzer"
import { lex as lexHxqa } from "@hxqa/lexer"
import { parse as parseHxqa } from "@hxqa/parser"
import { lex as lexJsonl } from "@jsonl/lexer"
import { parse as parseJsonl } from "@jsonl/parser"
import { generate as generateHxqa } from "@hxqa/generator"
import { generate as generateJsonl } from "@jsonl/generator"

type Compile = (hxqa: string) => SolidResult<string, CompilingError[]>

type Decompile = (jsonl: string) => SolidResult<string, CompilingError[]>

export const compile: Compile = (hxqa) => {
    const result = resultPass(hxqa)
        .then(lexHxqa)
        .then(parseHxqa)
        .then(analyze)
        .then(generateJsonl)
    return resultSolid(result)
}

export const decompile: Decompile = (jsonl) => {
    const result = resultPass(jsonl)
        .then(lexJsonl)
        .then(parseJsonl)
        .then(analyze)
        .then(generateHxqa)
    return resultSolid(result)
}