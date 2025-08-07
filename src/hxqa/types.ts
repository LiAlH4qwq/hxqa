export type Token = |
    ({ type: "newLine" } |
    { type: "startId" } |
    { type: "inputId" } |
    { type: "outputId" } |
    // TODO: { type: "referenceId" } |
    { type: "commentId" } |
    { type: "content", value: string }) &
    { mappingInfo: MappingInfo }

export type Statement =
    ({ type: "start", value?: string } |
    { type: "input", value: string } |
    { type: "output", value: string } |
    { type: "comment", value?: string }) &
    { mappingInfo: MappingInfo }

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
    stage: "ParsingError"
} & ({
    type: "MissingFollowingToken"
    details: "NoTextAfterInputOrOutput"
} | {
    type: "UnexpectedTokens"
    details: "TextBeforeIdentifiers"
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