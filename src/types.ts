export type Conversation = {
    systemPrompt: string
    questionAnswerPairs: QuestionAnswerPair[]
}

export type QuestionAnswerPair = {
    question: string
    answer: string
}