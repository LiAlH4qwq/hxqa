import { Result, resultPass, resultError, resultUnity } from "@/error"
import {
    Statement,
    QuestionAnswerPair,
    Conversation,
    AST,
    CompilingError,
    MappingInfo
} from "@/types"

type Analyze = (statements: Statement[]) => Result<AST, CompilingError[]>

type RemoveInvalidQuestionAnswerStatements =
    (accumulatedMappingInfo: MappingInfo, statements: Statement[], offset: number) =>
        [mappingInfo: typeof accumulatedMappingInfo, newOffset: typeof offset]

type TryFormingConversations =
    (accumulatedResults: (Result<Conversation, CompilingError[]>)[],
        statements: Statement[], offset: number) =>
        [results: typeof accumulatedResults, newOffset: typeof offset]

type TryFormingConversation = (statements: Statement[], offset: number) =>
    [result: Result<Conversation, CompilingError[]>, newOffset: typeof offset]

type TryFormingQuestionAnswerPairs =
    (accumulatedResults: (Result<QuestionAnswerPair, CompilingError>)[],
        statements: Statement[], offset: number) =>
        [results: typeof accumulatedResults, newOffset: typeof offset]

type TryFormingQuestionAnswerPair = (statements: Statement[], offset: number) =>
    [result: Result<QuestionAnswerPair, CompilingError>, newOffset: typeof offset]

export const analyze: Analyze = (statements) => {
    const statementsWithoutComments =
        statements.filter(statement => statement.type !== "comment")
    const [results, _] = tryFormingConversations([], statementsWithoutComments, 0)
    return resultUnity(results)
        .then(conversations => resultPass({ conversations: conversations }))
        .transError((errorsOfErrors) => errorsOfErrors.flat())
}

const removeInvalidQuestionAnswerStatements: RemoveInvalidQuestionAnswerStatements = (acc, stmts, offset) => {
    // may reach the end of statement stream
    // eg. there's no conversation start statement in the stream
    if (offset >= stmts.length) return [acc, offset]
    // reach conversation start statement, done
    const curStmt = stmts.at(offset)
    if (curStmt.type === "start") return [acc, offset]
    const newAcc = {
        ...acc,
        lineEnd: curStmt.mappingInfo.lineEnd,
        columnEnd: curStmt.mappingInfo.columnEnd
    }
    return removeInvalidQuestionAnswerStatements(newAcc, stmts, offset + 1)
}

const tryFormingConversations: TryFormingConversations = (accumulatedResults, statements, offset) => {
    if (offset >= statements.length) return [accumulatedResults, -1]
    const [result, newOffset] = tryFormingConversation(statements, offset)
    return tryFormingConversations([...accumulatedResults, result], statements, newOffset)
}

const tryFormingConversation: TryFormingConversation = (statements, offset) => {
    const currentStatement = statements.at(offset)
    // all non-start statement should be consumed
    // after forming conversation
    // so if them appears here
    // it can only be those at the heading of statement stream
    // deal with them, return an error
    // and continue analyzing to find rest possible errors
    if (currentStatement.type !== "start") {
        const [mappingInfo, newOffset] = removeInvalidQuestionAnswerStatements(
            currentStatement.mappingInfo, statements, offset)
        return [resultError([{
            stage: "AnalyzingError",
            type: "UnexpectedStatements",
            details: "QuestionOrAnswerBeforeConversation",
            mappingInfo: mappingInfo
        }]), newOffset]
    }
    // value of start statement is optional, so it maybe string or undefined
    const systemPrompt = currentStatement.value as string | undefined
    const [results, newOffset] = tryFormingQuestionAnswerPairs([], statements, offset + 1)
    if (results.length <= 0) return [resultError([{
        stage: "AnalyzingError",
        type: "MissingFollowingStatements",
        details: "ConversationMissingQuestionAnswerPairs",
        mappingInfo: currentStatement.mappingInfo
    }]), newOffset]
    return [resultUnity(results).then(
        (questionAnswerPairs) =>
            resultPass(systemPrompt === undefined ?
                { questionAnswerPairs: questionAnswerPairs } :
                { systemPrompt: systemPrompt, questionAnswerPairs: questionAnswerPairs }))
        , newOffset]
}

const tryFormingQuestionAnswerPairs: TryFormingQuestionAnswerPairs = (accumulatedResults, statements, offset) => {
    // may reach the end of statement stream
    if (offset >= statements.length) return [accumulatedResults, offset]
    const currentStatement = statements.at(offset)
    if (currentStatement.type === "start") return [accumulatedResults, offset]
    const [result, newOffset] = tryFormingQuestionAnswerPair(statements, offset)
    return tryFormingQuestionAnswerPairs([...accumulatedResults, result], statements, newOffset)
}

const tryFormingQuestionAnswerPair: TryFormingQuestionAnswerPair = (statements, offset) => {
    const maybeQ = statements.at(offset)
    const maybeA = statements.at(offset + 1)
    if (maybeQ.type !== "input") return [resultError({
        stage: "AnalyzingError",
        type: "UnexpectedStatements",
        details: "ExpectedInputButGetOutput",
        mappingInfo: maybeQ.mappingInfo
    }), offset + 1]
    if (offset >= statements.length - 1 || maybeA.type !== "output") return [resultError({
        stage: "AnalyzingError",
        type: "MissingFollowingStatements",
        details: "QuestionMissingAnswer",
        mappingInfo: statements[0].mappingInfo
    }), offset + 1]
    return [resultPass({
        question: maybeQ.value,
        answer: maybeA.value
    }), offset + 2]
}