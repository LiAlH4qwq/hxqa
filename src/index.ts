import * as error from "./error"
import * as hxqaTypes from "./hxqa/types"
import * as hxqaLexer from "./hxqa/lexer"
import * as hxqaParser from "./hxqa/parser"
import * as hxqaAnalyzer from "./hxqa/analyzer"
import * as jsonlGenerator from "./jsonl/generator"

type Compile = (hxqa: string) => error.SolidResult<string, hxqaTypes.CompilingError[]>

export const compile: Compile = (hxqa) => {
    const result = error.resultPass(hxqa)
        .then(hxqaLexer.lex)
        .then(hxqaParser.parse)
        .then(hxqaAnalyzer.analyze)
        .then(jsonlGenerator.generate)
    return error.resultSolid(result)
}