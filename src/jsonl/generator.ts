import { Result, resultPass } from "@/error"
import { Message, Conversation as JsonlConversation } from "@jsonl/types"
import { Conversation, AST } from "@/types"
type Generate = (ast: AST) => Result<string, never>

type GenerateJsonlLine = (conversation: Conversation) => JsonlConversation

export const generate: Generate = (ast) => {
    const jsonlLines = ast.conversations.map(generateJsonlLine)
    const jsonlLinesStrings = jsonlLines.map(jsonlLines => JSON.stringify(jsonlLines))
    return resultPass(jsonlLinesStrings.join("\n"))
}

const generateJsonlLine: GenerateJsonlLine = (conversation) => {
    // systemPrompt is an optional node
    const systemPrompt = conversation.systemPrompt as string | undefined
    const messages = conversation.questionAnswerPairs.map((questionAnswerPair) => [
        { role: "user", content: questionAnswerPair.question },
        { role: "assistant", content: questionAnswerPair.answer }
    ]).flat()
    const jsonlLine = {
        messages: [...systemPrompt === undefined ? [] :
            [{ role: "system", content: systemPrompt }], ...messages] as Message[]
    }
    return jsonlLine
}