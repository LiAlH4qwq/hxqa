import * as error from "../error"
import * as jsonlTypes from "./types"
import * as genericTypes from "../types"

type Generate = (ast: genericTypes.AST) => error.Result<string, never>

type GenerateJsonlLine = (conversation: genericTypes.Conversation) => jsonlTypes.JsonlLine

export const generate: Generate = (ast) => {
    const jsonlLines = ast.conversations.map(generateJsonlLine)
    const jsonlLinesStrings = jsonlLines.map(jsonlLines => JSON.stringify(jsonlLines))
    return error.resultPass(jsonlLinesStrings.join("\n"))
}

const generateJsonlLine: GenerateJsonlLine = (conversation) => {
    // systemPrompt is an optional node
    const systemPrompt = conversation.systemPrompt as string | undefined
    const messages = conversation.questionAnswerPairs.map((questionAnswerPair) => [
        { role: "user", content: questionAnswerPair.question },
        { role: "assistant", content: questionAnswerPair.answer }
    ]).flat()
    const jsonlLine = { messages: [...systemPrompt === undefined ? [] : [{ role: "system", content: systemPrompt }], ...messages] as jsonlTypes.Message[] }
    return jsonlLine
}