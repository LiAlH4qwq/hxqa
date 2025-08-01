import * as jsonlTypes from "./types"
import * as genericTypes from "../types"

export const generate = (ast: genericTypes.AST): string => {
    const jsonl = ast.conversations.map(generateJson).join("\n")
    return jsonl
}

const generateJson = (conversation: genericTypes.Conversation): string => {
    const systemPrompt = conversation.systemPrompt
    const messages = conversation.questionAnswerPairs.reduce((messages, questionAnswerPair) => {
        const input = { role: "user", content: questionAnswerPair.question } as jsonlTypes.Message
        const output = { role: "assistant", content: questionAnswerPair.answer } as jsonlTypes.Message
        return [...messages, input, output]
    },
        systemPrompt === undefined ?
            [] as jsonlTypes.Message[] :
            [{ role: "system", content: systemPrompt }] as jsonlTypes.Message[]
    )
    const json = JSON.stringify({ messages: messages })
    return json
}