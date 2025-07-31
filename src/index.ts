import * as lexer from "./hxqa/lexer"
import * as parser from "./hxqa/parser"
const hxqa = `
::: system prompt
<<< user input
>>>
ai output
`
const tokens = lexer.lex(hxqa)
const statements = parser.parse(tokens)
console.log(hxqa)
console.log(tokens)
console.log(statements)
