import * as error from "src/error"
import * as hxqaTypes from "hxqa/types"
import * as genericTypes from "src/types"

type AnalyzingError = ({
    type: "UnexpectedStatements"
    details: "QuestionOrAnswerBeforeConversation" | "ExpectedInputButGetOutput"
} | {
    type: "MissingFollowingStatements"
    details: "ConversationMissingQuestionAnswerPairs" | "QuestionMissingAnswer"
}) & {
    mappingInfo: hxqaTypes.MappingInfo
}

type Analyze = (statements: hxqaTypes.Statement[]) =>
    error.Result<genericTypes.AST, never> | error.Result<never, AnalyzingError[]>

type RemoveInvalidQuestionAnswerStatements =
    (accumulatedMappingInfo: hxqaTypes.MappingInfo, statements: hxqaTypes.Statement[]) =>
        [mappingInfo: typeof accumulatedMappingInfo, restStatements: typeof statements]

type TryFormingConversations = (accumulatedResults: (error.Result<genericTypes.Conversation, never> |
    error.Result<never, AnalyzingError[]>)[],
    statements: hxqaTypes.Statement[]) =>
    [results: typeof accumulatedResults, restStatements: typeof statements]

type TryFormingConversation = (statements: hxqaTypes.Statement[]) =>
    [result: error.Result<genericTypes.Conversation, never> |
        error.Result<never, AnalyzingError[]>, restStatements: typeof statements]

type TryFormingQuestionAnswerPairs =
    (accumulatedResults: (error.Result<genericTypes.QuestionAnswerPair, never> |
        error.Result<never, AnalyzingError>)[],
        statements: hxqaTypes.Statement[]) =>
        [results: typeof accumulatedResults, restStatements: typeof statements]

type TryFormingQuestionAnswerPair = (statements: hxqaTypes.Statement[]) =>
    [result: error.Result<genericTypes.QuestionAnswerPair, never> |
        error.Result<never, AnalyzingError>, restStatements: typeof statements]

export const analyze: Analyze = (statements) => {
    const statementsWithoutComments = statements.filter(statement => statement.type !== "comment")
    const [results, _] = tryFormingConversations([], statementsWithoutComments)
    return error.resultUnity(results).then(conversations => error.resultPass({ conversations: conversations })).transError((errorsofErrors) => errorsofErrors.flat())
}

const removeInvalidQuestionAnswerStatements: RemoveInvalidQuestionAnswerStatements = (acc, stmts) => {
    // may reach the end of statement stream
    // eg. there's no conversation start statement in the stream
    if (stmts.length <= 0) return [acc, []]
    // reach conversation start statement, done
    if (stmts[0].type === "start") return [acc, stmts]
    const newAcc = {
        ...acc,
        lineEnd: stmts[0].mappingInfo.lineEnd,
        columnEnd: stmts[0].mappingInfo.columnEnd
    }
    return removeInvalidQuestionAnswerStatements(newAcc, stmts.slice(1))
}

const tryFormingConversations: TryFormingConversations = (accumulatedResults, statements) => {
    if (statements.length <= 0) return [accumulatedResults, []]
    const [result, restStatements] = tryFormingConversation(statements)
    return tryFormingConversations([...accumulatedResults, result], restStatements)
}

const tryFormingConversation: TryFormingConversation = (statements) => {
    const currentStatement = statements[0]
    // all non-start statement should be consumed
    // after forming conversation
    // so if them appears here
    // it can only be those at the heading of statement stream
    // deal with them, return an error
    // and continue analyzing to find rest possible errors
    if (currentStatement.type !== "start") {
        const [mappingInfo, restStatements] = removeInvalidQuestionAnswerStatements(
            currentStatement.mappingInfo, statements.slice(1))
        return [error.resultError([{
            type: "UnexpectedStatements",
            details: "QuestionOrAnswerBeforeConversation",
            mappingInfo: mappingInfo
        }]), restStatements]
    }
    // value of start statement is optional, so it maybe string or undefined
    const systemPrompt = currentStatement.value as string | undefined
    const [results, restStatements] = tryFormingQuestionAnswerPairs([], statements.slice(1))
    if (results.length <= 0) return [error.resultError([{
        type: "MissingFollowingStatements",
        details: "ConversationMissingQuestionAnswerPairs",
        mappingInfo: currentStatement.mappingInfo
    }])
        , restStatements]
    return [error.resultUnity(results).then(
        (questionAnswerPairs) =>
            error.resultPass(systemPrompt === undefined ?
                { questionAnswerPairs: questionAnswerPairs } :
                { systemPrompt: systemPrompt, questionAnswerPairs: questionAnswerPairs }))
        , restStatements]
}

const tryFormingQuestionAnswerPairs: TryFormingQuestionAnswerPairs = (accumulatedResults, statements) => {
    // may reach the end of statement stream
    if (statements.length <= 0) return [accumulatedResults, []]
    const currentStatement = statements[0]
    if (currentStatement.type === "start") return [accumulatedResults, statements]
    const [result, restStatements] = tryFormingQuestionAnswerPair(statements)
    return tryFormingQuestionAnswerPairs([...accumulatedResults, result], restStatements)
}

const tryFormingQuestionAnswerPair: TryFormingQuestionAnswerPair = (statements) => {
    if (statements[0].type !== "input") return [error.resultError({
        type: "UnexpectedStatements",
        details: "ExpectedInputButGetOutput",
        mappingInfo: statements[0].mappingInfo
    }), statements.slice(1)]
    if (statements.length <= 1 || statements[1].type !== "output") return [error.resultError({
        type: "MissingFollowingStatements",
        details: "QuestionMissingAnswer",
        mappingInfo: statements[0].mappingInfo
    }), statements.slice(1)]
    return [error.resultPass({
        question: statements[0].value,
        answer: statements[1].value
    }), statements.slice(2)]
}