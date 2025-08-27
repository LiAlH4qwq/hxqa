import { Result, resultPass, resultError, resultUnity } from "@/error"
import { Statement, CompilingError } from "@/types"
import { Token } from "@hxqa/types"

type Parse = (tokens: Token[]) => Result<Statement[], CompilingError[]>

type RemoveNewLineTokens = (tokens: Token[], offset: number) => typeof offset

type TryFormingStatements =
    (accumulatedResults: Result<Statement, CompilingError>[], tokens: Token[], offset: number) =>
        [results: typeof accumulatedResults, newOffset: typeof offset]

type TryFormingStatement = (tokens: Token[], offset: number) =>
    [result: Result<Statement, CompilingError>, newOffset: typeof offset]

type CollectingText = (accumulatedTexts: string[], tokens: Token[], offset: number) =>
    [texts: typeof accumulatedTexts, newOffset: typeof offset]

export const parse: Parse = (tokens) => {
    // to preserve line mapping info
    // token list produce by lexer may have newline token at the heading
    // it's not error, just remove it
    const offset = removeNewLineTokens(tokens, 0)
    if (offset >= tokens.length) return resultError([{
        stage: "ParsingError",
        type: "NoTokens"
    }])
    const [results, _] = tryFormingStatements([], tokens, offset)
    return resultUnity(results)
}

const removeNewLineTokens: RemoveNewLineTokens = (tokens, offset) => {
    if (tokens.at(offset).type !== "newLine") return offset
    return removeNewLineTokens(tokens, offset + 1)
}

const tryFormingStatements: TryFormingStatements = (accumulatedResults, tokens, offset) => {
    if (offset >= tokens.length) return [accumulatedResults, -1]
    const [result, newOffset] = tryFormingStatement(tokens, offset)
    return tryFormingStatements([...accumulatedResults, result], tokens, newOffset)
}

const tryFormingStatement: TryFormingStatement = (tokens, offset) => {
    const currentToken = tokens.at(offset)
    // all non-id tokens after id tokens
    // should be comsumed after forming statements
    // so if non-id tokens appears here
    // it can only be those at the head of tokens stream
    // so deal with it, return a error result
    // and continue parsing
    // for checking other possible errors
    if (currentToken.type === "content" || currentToken.type === "newLine") {
        const [_, newOffset] = collectingText([], tokens, offset)
        const textEndingToken = tokens.at(newOffset - 1)
        return [resultError({
            stage: "ParsingError",
            type: "UnexpectedTokens",
            details: "TextBeforeIdentifiers",
            mappingInfo: {
                lineStart: currentToken.mappingInfo.lineStart,
                lineEnd: textEndingToken.mappingInfo.lineEnd,
                columnStart: currentToken.mappingInfo.columnStart,
                columnEnd: textEndingToken.mappingInfo.columnEnd
            }
        }), newOffset]
    }
    const [texts, newOffset] = collectingText([], tokens, offset + 1)
    const text = texts.join("").trim()
    if (text === "" && (currentToken.type === "inputId" || currentToken.type === "outputId"))
        return [resultError({
            stage: "ParsingError",
            type: "MissingFollowingTokens",
            details: "NoTextAfterInputOrOutput",
            mappingInfo: currentToken.mappingInfo,
        }), newOffset]
    else if (text === "" && (currentToken.type === "startId" || currentToken.type === "commentId"))
        return [resultPass({
            type: currentToken.type === "startId" ? "start" : "comment",
            mappingInfo: {
                lineStart: currentToken.mappingInfo.lineStart,
                lineEnd: currentToken.mappingInfo.lineEnd,
                columnStart: currentToken.mappingInfo.columnStart,
                columnEnd: currentToken.mappingInfo.columnEnd
            }
        }), newOffset]
    else {
        const textEndingToken = tokens.at(newOffset - 1)
        return [resultPass({
            type: currentToken.type.slice(0, -2) as "start" | "input" | "output" | "comment",
            value: text,
            mappingInfo: {
                lineStart: currentToken.mappingInfo.lineStart,
                lineEnd: textEndingToken.mappingInfo.lineEnd,
                columnStart: currentToken.mappingInfo.columnStart,
                columnEnd: textEndingToken.mappingInfo.columnEnd
            }
        }), newOffset]
    }
}

const collectingText: CollectingText = (accumulatedText, tokens, offset) => {
    // may reach the end of token list
    if (offset >= tokens.length) return [accumulatedText, offset]
    const currentToken = tokens.at(offset)
    // or meet id token
    // both means text collecting end
    if (!(currentToken.type === "content" || currentToken.type === "newLine"))
        return [accumulatedText, offset]
    const currentText = currentToken.type === "newLine" ? "\n" : currentToken.value
    return collectingText([...accumulatedText, currentText], tokens, offset + 1)
}