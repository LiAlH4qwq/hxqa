export type Statement = (
    { type: "start", value?: string } |
    { type: "input", value: string } |
    { type: "output", value: string } |
    { type: "comment", value?: string }
) & { mappingInfo: MappingInfo }

export type AST = {
    conversations: Conversation[]
}

export type Conversation = {
    systemPrompt?: string
    questionAnswerPairs: QuestionAnswerPair[]
}

export type QuestionAnswerPair = {
    question: string
    answer: string
}

export type MappingInfo = {
    lineStart: number
    lineEnd: number
    columnStart: number
    columnEnd: number
}

export type CompilingError = {
    stage: "ParsingError"
    type: "NoTokens"
} | ({
    stage: "LexingError"
    type: "JsonlMisform"
    details: "LineIsNotValidJson"
} | {
    stage: "ParsingError"
} & ({
    type: "UnexpectedTokens"
    details: "TextBeforeIdentifiers"
} | {
    type: "MissingFollowingTokens"
    details: "NoTextAfterInputOrOutput"
} | {
    type: "JsonMisform"
    details:
    | "JsonIsNotAnObject"
    | "JsonObjectNotContainsAndOnlyContainsMessagesProp"
    | "JsonObjectMessagesNotArray"
    | "JsonObjectMessagesEmpty"
    | "JsonObjectMessagesChildNotAllObject"
    | "JsonObjectMessagesChildNotAllIsMessage"
}) | {
    stage: "AnalyzingError"
} | & ({
    type: "UnexpectedStatements"
    details: "QuestionOrAnswerBeforeConversation" | "ExpectedInputButGetOutput"
} | {
    type: "MissingFollowingStatements"
    details: "ConversationMissingQuestionAnswerPairs" | "QuestionMissingAnswer"
})) & {
    mappingInfo: MappingInfo
}