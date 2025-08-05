import * as error from "src/error"
import * as lexer from "hxqa/lexer"
import * as parser from "hxqa/parser"
import * as analyzer from "hxqa/analyzer"
import * as generator from "jsonl/generator"


type Compile = (hxqa: string) => string

export const compile: Compile = (hxqa) => {
    return error.resultPass(hxqa)
        .then(lexer.lex)
        .then(parser.parse)
        .then(analyzer.analyze)
        .then(generator.generate)
        .transError((compilingError) => JSON.stringify(compilingError, undefined, "  "))
        .out()
}