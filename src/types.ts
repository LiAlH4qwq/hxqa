export type AST = {
    comments: string[]
    conversations: Conversation[]
}

export type Conversation = {
    systemPrompt?: string
    comments: string[]
    questionAnswerPairs: QuestionAnswerPair[]
}

export type QuestionAnswerPair = {
    question: string
    answer: string
}