import * as error from "../error"
import * as types from "./types"

type ParsingError = ({
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

type OmittingUnexpectedText = (accumulator: error.Result<never, ParsingError>[], tokens: types.Token[]) =>
    [result: typeof accumulator, restTokens: typeof tokens]

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
    const [resultsBeforeId, restTokens] = omittingUnexpectedText([], tokens)
    const resultsBeforeIdReduced = resultsBeforeId.length <= 0 ? [] :
        [error.resultError({
            ...resultsBeforeId[0]!!.out(),
            mappingInfo: {
                ...resultsBeforeId[0]!!.out().mappingInfo,
                lineEnd: resultsBeforeId.at(-1)!!.out().mappingInfo.lineEnd,
                columnEnd: resultsBeforeId.at(-1)!!.out().mappingInfo.columnEnd
            }
        })]
    const [results, _] = tryFormingStatements([], tokens)
    return error.resultUnity([...resultsBeforeIdReduced, ...results])
}

const omittingUnexpectedText: OmittingUnexpectedText = (accumulator, tokens) => {
    const currentToken = tokens[0]!!
    if (["startId", "inputId", "outputId", "commentId"].includes(currentToken.type))
        return [accumulator, tokens]
    const errorResult = error.resultError({
        type: "UnexpectedTokens" as "UnexpectedTokens",
        details: "TextBeforeIdentifiers" as "TextBeforeIdentifiers",
        mappingInfo: {
            lineStart: currentToken.mappingInfo.lineStart,
            lineEnd: currentToken.mappingInfo.lineEnd,
            columnStart: currentToken.mappingInfo.columnStart,
            columnEnd: currentToken.mappingInfo.columnEnd
        }
    })
    return omittingUnexpectedText([...accumulator, errorResult], tokens.slice(1))
}

const tryFormingStatements: TryFormingStatements = (accumulatedResults, tokens) => {
    if (tokens.length <= 0) return [accumulatedResults, tokens]
    const [result, restTokens] = tryFormingStatement(tokens)
    return tryFormingStatements([...accumulatedResults, result], restTokens)
}

const tryFormingStatement: TryFormingStatement = (tokens) => {
    const currentToken = tokens[0]
    const [texts, restTokens] = collectingText([], tokens.slice(1))
    const text = texts.join("").trim()
    const textTokenCount = texts.length
    if (text === "" && (currentToken!!.type === "inputId" || currentToken!!.type === "outputId"))
        return [error.resultError({
            type: "MissingFollowingToken",
            details: "NoTextAfterInputOrOutput",
            mappingInfo: currentToken!!.mappingInfo,
        }), restTokens]
    else if (text === "" && (currentToken!!.type === "startId" || currentToken!!.type === "commentId"))
        return [error.resultPass({
            type: currentToken!!.type === "startId" ? "start" : "comment",
            mappingInfo: {
                lineStart: currentToken!!.mappingInfo.lineStart,
                lineEnd: tokens[textTokenCount]!!.mappingInfo.lineEnd,
                columnStart: currentToken!!.mappingInfo.columnStart,
                columnEnd: tokens[textTokenCount]!!.mappingInfo.columnEnd
            }
        }), restTokens]
    else return [error.resultPass({
        type: currentToken!!.type.slice(0, -2) as "start" | "input" | "output" | "comment",
        value: text,
        mappingInfo: {
            lineStart: currentToken!!.mappingInfo.lineStart,
            lineEnd: tokens[textTokenCount]!!.mappingInfo.lineEnd,
            columnStart: currentToken!!.mappingInfo.columnStart,
            columnEnd: tokens[textTokenCount]!!.mappingInfo.columnEnd
        }
    }), restTokens]
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