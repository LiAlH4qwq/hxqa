import * as lexer from "./hxqa/lexer"
import * as parser from "./hxqa/parser"
import * as analyzer from "./hxqa/analyzer"
import * as generator from "./jsonl/generator"
import * as error from "./error"
const hxqa = `
system prompt
<<< user input
>>>
>>>
ai output
/// comment
:::
sys
line
<<< user ask
>>>
balabala
...
`
const main = () => {
    console.log("hxqa:\n", hxqa, "\n")
    const tokens = lexer.lex(hxqa)
    console.log("tokens:\n", JSON.stringify(tokens, null, "    "), "\n")
    const statements = parser.parse(tokens).out()
    console.log("statements:\n", statements, "\n")
    /* const ast = analyzer.analyze(statements)
    console.log("ast:\n", ast, "\n")
    console.log("qa 1 pairs above:\n", ast.conversations[0].questionAnswerPairs, "\n")
    console.log("qa 2 pairs above:\n", ast.conversations[1].questionAnswerPairs, "\n")
    console.log("jsonl:\n", jsonl, "\n") */
}

main()