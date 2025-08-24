import * as error from "../error"
import * as types from "./types"



type Parse = (tokens: types.Token[]) =>
    error.Result<types.Statement[], types.CompilingError[]>

type RemoveNewLineTokens = (tokens: types.Token[]) => typeof tokens

type TryFormingStatements = (accumulatedResults: (
    error.Result<types.Statement, never> | error.Result<never, types.CompilingError>)[],
    tokens: types.Token[]) =>
    [results: typeof accumulatedResults, restTokens: typeof tokens]

type TryFormingStatement = (tokens: types.Token[]) =>
    [result: error.Result<types.Statement, never> | error.Result<never, types.CompilingError>,
        restTokens: typeof tokens]

type CollectingText = (accumulatedTexts: string[], tokens: types.Token[]) =>
    [texts: typeof accumulatedTexts, restTokens: typeof tokens]

export const parse: Parse = (tokens) => {
    if (tokens.length <= 0) return error.resultError([{
        stage: "ParsingError",
        type: "NoTokens"
    }])
    // to preserve line mapping info
    // token list produce by lexer may have newline token at the heading
    // it's not error, just remove it
    const tokensRemovedHeadingNewLines = removeNewLineTokens(tokens)
    if (tokensRemovedHeadingNewLines.length <= 0) return error.resultError([{
        stage: "ParsingError",
        type: "NoTokens"
    }])
    const [results, _] = tryFormingStatements([], tokensRemovedHeadingNewLines)
    return error.resultUnity(results)
}

const removeNewLineTokens: RemoveNewLineTokens = (tokens) => {
    if (tokens[0].type !== "newLine") return tokens
    return removeNewLineTokens(tokens.slice(1))
}

const tryFormingStatements: TryFormingStatements = (accumulatedResults, tokens) => {
    if (tokens.length <= 0) return [accumulatedResults, tokens]
    const [result, restTokens] = tryFormingStatement(tokens)
    return tryFormingStatements([...accumulatedResults, result], restTokens)
}

const tryFormingStatement: TryFormingStatement = (tokens) => {
    const currentToken = tokens[0]
    // all non-id tokens after id tokens
    // should be comsumed after forming statements
    // so if non-id tokens appears here
    // it can only be those at the head of tokens stream
    // so deal with it, return a error result
    // and continue parsing
    // for checking other possible errors
    if (currentToken.type === "content" || currentToken.type === "newLine") {
        const [texts, restTokens] = collectingText([], tokens)
        const textTokenCount = texts.length
        const textEndingToken = tokens[textTokenCount - 1]
        return [error.resultError({
            stage: "ParsingError",
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
            stage: "ParsingError",
            type: "MissingFollowingToken",
            details: "NoTextAfterInputOrOutput",
            mappingInfo: currentToken.mappingInfo,
        }), restTokens]
    else if (text === "" && (currentToken.type === "startId" || currentToken.type === "commentId"))
        return [error.resultPass({
            type: currentToken.type === "startId" ? "start" : "comment",
            mappingInfo: {
                lineStart: currentToken.mappingInfo.lineStart,
                lineEnd: currentToken.mappingInfo.lineEnd,
                columnStart: currentToken.mappingInfo.columnStart,
                columnEnd: currentToken.mappingInfo.columnEnd
            }
        }), restTokens]
    else {
        const textEndingToken = tokens[textTokenCount]
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
    if (tokens.length <= 0) return [accumulatedText, tokens]
    const currentToken = tokens[0]
    // or meet id token
    // both means text collecting end
    if (!(currentToken.type === "content" || currentToken.type === "newLine"))
        return [accumulatedText, tokens]
    const currentText = currentToken.type === "newLine" ? "\n" : currentToken.value
    return collectingText([...accumulatedText, currentText], tokens.slice(1))
}