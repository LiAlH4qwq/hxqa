import { Result, resultPass } from "@/error";
import { AST, Conversation, QuestionAnswerPair } from "@/types";

type Generate = (ast: AST) => Result<string, never>

type GenerateConversations = (accParts: string[], conversations: Conversation[], offset: number) =>
    [parts: typeof accParts, newOffset: typeof offset]

type GenerateConversation = (conversation: Conversation) => string[]

type GenerateQAParirs = (accParts: string[], qaPairs: QuestionAnswerPair[], offset: number) =>
    [parts: typeof accParts, newOffset: typeof offset]

export const generate: Generate = (ast) => {
    const conversations = ast.conversations
    const [parts, _] = generateConversations([], conversations, 0)
    const hxqa = parts.join("\n")
    return resultPass(hxqa)
}

const generateConversations: GenerateConversations = (accParts, conversations, offset) => {
    if (offset >= conversations.length) return [accParts, -1]
    const parts = generateConversation(conversations.at(offset))
    const newParts = [...accParts, ...parts]
    return generateConversations(newParts, conversations, offset + 1)
}

const generateConversation: GenerateConversation = (conversation) => {
    const [parts, _] = generateQAPairs([], conversation.questionAnswerPairs, 0)
    return conversation.systemPrompt === undefined ? parts : [":::", conversation.systemPrompt, "", ...parts]
}

const generateQAPairs: GenerateQAParirs = (accParts, qaPairs, offset) => {
    if (offset >= qaPairs.length) return [accParts, -1]
    const qaPair = qaPairs.at(offset)
    const parts = ["<<<", qaPair.question, "", ">>>", qaPair.answer, ""]
    const newParts = [...accParts, ...parts]
    return generateQAPairs(newParts, qaPairs, offset + 1)
}