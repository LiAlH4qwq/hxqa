import * as error from "../error"
import * as types from "./types"

type ParsingError = {
    type: "EmptyText"
    tokenMappingInfo: types.MappingInfo
}

export const parse = (tokens: types.Token[]): error.Result<types.Statement[], ParsingError[]> => {
    const [results, _] = tryFormingStatements([], tokens)
    const errors = results.filter(result => !result.pass).map(result => result.out())
    if (errors.length >= 1) return error.resultError(errors)
    const statements = results.map(result => result.out()) as types.Statement[]
    return error.resultPass(statements)
}

const tryFormingStatements = (accumulatedResults: error.Result<types.Statement, ParsingError>[], tokens: types.Token[]): [results: error.Result<types.Statement, ParsingError>[], restTokens: types.Token[]] => {
    if (tokens.length <= 0) return [accumulatedResults, tokens]
    const [result, restTokens] = tryFormingStatement(tokens)
    return tryFormingStatements([...accumulatedResults, result], restTokens)
}

const tryFormingStatement = (tokens: types.Token[]): [result: error.Result<types.Statement, ParsingError>, restTokens: types.Token[]] => {
    const currentToken = tokens[0]
    const [text, textTokenCount, restTokens] = collectText("", 0, tokens.slice(1))
    const trimedText = text.trim()
    if (trimedText === "" && (currentToken.type === "inputId" || currentToken.type === "outputId"))
        return [error.resultError({
            type: "EmptyText",
            tokenMappingInfo: currentToken.mappingInfo,
        }), restTokens]
    else if (trimedText === "" && (currentToken.type === "startId" || currentToken.type === "commentId"))
        return [error.resultPass({
            type: currentToken.type === "startId" ? "start" : "comment",
            mappingInfo: {
                lineStart: currentToken.mappingInfo.lineStart,
                lineEnd: tokens[textTokenCount - 1].mappingInfo.lineEnd,
                columnStart: currentToken.mappingInfo.columnStart,
                columnEnd: tokens[textTokenCount - 1].mappingInfo.columnEnd
            }
        }), restTokens]
    else return [error.resultPass({
        type: currentToken.type.slice(0, -2) as "start" | "input" | "output" | "comment",
        value: trimedText,
        mappingInfo: {
            lineStart: currentToken.mappingInfo.lineStart,
            lineEnd: tokens[textTokenCount - 1].mappingInfo.lineEnd,
            columnStart: currentToken.mappingInfo.columnStart,
            columnEnd: tokens[textTokenCount - 1].mappingInfo.columnEnd
        }
    }), restTokens]
}

const collectText = (accumulatedText: string, accumulatedTokenCount: number, tokens: types.Token[]): [text: string, tokenCount: number, restTokens: types.Token[]] => {
    // may reach the end of token list
    // or other token
    // both means text collecting end
    if (tokens.length <= 0 ||
        (!(tokens[0].type === "content" || tokens[0].type === "newLine"))
    ) return [accumulatedText, accumulatedTokenCount, tokens]
    const currentText = tokens[0].type === "newLine" ? "\n" : tokens[0].value
    return collectText(accumulatedText + currentText, accumulatedTokenCount + 1, tokens.slice(1))
}