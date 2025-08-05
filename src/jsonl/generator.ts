import * as error from "src/error"
import * as jsonlTypes from "jsonl/types"
import * as genericTypes from "src/types"

type Generate = (ast: genericTypes.AST) => error.Result<string, never>

type GenerateJson = (conversation: genericTypes.Conversation) => string

export const generate: Generate = (ast) => {
    const jsonl = ast.conversations.map(generateJson).join("\n")
    return error.resultPass(jsonl)
}

const generateJson: GenerateJson = (conversation) => {
    // systemPrompt is an optional node
    const systemPrompt = conversation.systemPrompt as string | undefined
    const messages = conversation.questionAnswerPairs.map((questionAnswerPair) => [
        { role: "user", content: questionAnswerPair.question },
        { role: "assistant", content: questionAnswerPair.answer }
    ]).flat()
    const json = JSON.stringify({ messages: messages })
    return json
}