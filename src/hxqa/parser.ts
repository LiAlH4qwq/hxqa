import * as error from "../error"
import * as types from "./types"

type ParsingError = {
    type: "NoTokens" | "UnknownError"
} | ({
    type: "MissingFollowingToken"
    details: "NoTextAfterInputOrOutput"
} | {
    type: "UnexpectedTokens"
    details: "TextBeforeIdentifiers"
}) & {
    mappingInfo: types.MappingInfo
}

type Parse = (tokens: types.Token[]) =>
    error.Result<types.Statement[], never> | error.Result<never, ParsingError[]>

type RemoveNewLineTokens = (tokens: types.Token[]) => typeof tokens

type TryFormingStatements = (accumulatedResults: (
    error.Result<types.Statement, never> | error.Result<never, ParsingError>)[],
    tokens: types.Token[]) =>
    [results: typeof accumulatedResults, restTokens: typeof tokens]

type TryFormingStatement = (tokens: types.Token[]) =>
    [result: error.Result<types.Statement, never> | error.Result<never, ParsingError>,
        restTokens: typeof tokens]

type CollectingText = (accumulatedTexts: string[], tokens: types.Token[]) =>
    [texts: typeof accumulatedTexts, restTokens: typeof tokens]

export const parse: Parse = (tokens) => {
    if (tokens.length <= 0) return error.resultError([{ type: "NoTokens" }])
    // to preserve line mapping info
    // token list produce by lexer may have newline token at the heading
    // it's not error, just remove it
    const tokensRemovedHeadingNewLine = removeNewLineTokens(tokens)
    if (tokensRemovedHeadingNewLine.length <= 0) return error.resultError([{ type: "NoTokens" }])
    const [results, _] = tryFormingStatements([], tokensRemovedHeadingNewLine)
    return error.resultUnity(results)
}

const removeNewLineTokens: RemoveNewLineTokens = (tokens) => {
    // token list shoudn't be empty
    // since checked in parse
    const currentToken = tokens[0]
    if (currentToken === undefined) return []
    if (currentToken.type !== "newLine") return tokens
    return removeNewLineTokens(tokens.slice(1))
}

const tryFormingStatements: TryFormingStatements = (accumulatedResults, tokens) => {
    if (tokens.length <= 0) return [accumulatedResults, tokens]
    const [result, restTokens] = tryFormingStatement(tokens)
    return tryFormingStatements([...accumulatedResults, result], restTokens)
}

const tryFormingStatement: TryFormingStatement = (tokens) => {
    // first token should exist
    // since token list must greater than 0
    // checked in tryFormingStatement
    const currentToken = tokens[0]!!
    // all non-id tokens should be comsumed when forming statements
    // so if non-id tokens appears here
    // it can only be those at the head of tokens list
    // so deal with it, return a error result
    // and continue parsing for checking other possible errors
    if (currentToken.type === "content" || currentToken.type === "newLine") {
        const [texts, restTokens] = collectingText([], tokens)
        const textTokenCount = texts.length
        // token of the end of the texts should be exist
        // at least, should be same token as token of the head of the texts
        const textEndingToken = tokens[textTokenCount - 1]!!
        return [error.resultError({
            type: "UnexpectedTokens",
            details: "TextBeforeIdentifiers",
            mappingInfo: {
                lineStart: currentToken.mappingInfo.lineStart,
                lineEnd: textEndingToken.mappingInfo.lineEnd,
                columnStart: currentToken.mappingInfo.columnStart,
                columnEnd: textEndingToken.mappingInfo.columnEnd
            }
        }), restTokens]
    }
    const [texts, restTokens] = collectingText([], tokens.slice(1))
    const text = texts.join("").trim()
    const textTokenCount = texts.length

    if (text === "" && (currentToken.type === "inputId" || currentToken.type === "outputId"))
        return [error.resultError({
            type: "MissingFollowingToken",
            details: "NoTextAfterInputOrOutput",
            mappingInfo: currentToken.mappingInfo,
        }), restTokens]
    else if (text === "" && (currentToken.type === "startId" || currentToken.type === "commentId"))
        return [error.resultPass({
            type: currentToken!!.type === "startId" ? "start" : "comment",
            mappingInfo: {
                lineStart: currentToken.mappingInfo.lineStart,
                lineEnd: currentToken.mappingInfo.lineEnd,
                columnStart: currentToken.mappingInfo.columnStart,
                columnEnd: currentToken.mappingInfo.columnEnd
            }
        }), restTokens]
    else {
        // token of the end of the texts should be exist
        // at least, should be same token as token of the head of the texts
        // as checked above
        const textEndingToken = tokens[textTokenCount]!!
        return [error.resultPass({
            type: currentToken.type.slice(0, -2) as "start" | "input" | "output" | "comment",
            value: text,
            mappingInfo: {
                lineStart: currentToken.mappingInfo.lineStart,
                lineEnd: textEndingToken.mappingInfo.lineEnd,
                columnStart: currentToken.mappingInfo.columnStart,
                columnEnd: textEndingToken.mappingInfo.columnEnd
            }
        }), restTokens]
    }
}

const collectingText: CollectingText = (accumulatedText, tokens) => {
    // may reach the end of token list
    // or meet other token
    // both means text collecting end
    if (tokens.length <= 0 ||
        (!(tokens[0]!!.type === "content" || tokens[0]!!.type === "newLine"))
    ) return [accumulatedText, tokens]
    const currentText = tokens[0]!!.type === "newLine" ? "\n" : tokens[0]!!.value
    return collectingText([...accumulatedText, currentText], tokens.slice(1))
}