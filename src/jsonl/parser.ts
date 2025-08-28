import { Result, resultPass, resultError, resultUnity } from "@/error"
import { Statement, CompilingError } from "@/types"
import { UnknownStructrue, Messages } from "@jsonl/types"

type Parse = (jsonlLines: UnknownStructrue[]) => Result<Statement[], CompilingError[]>

type ParseJsonlLine = (jsonlLine: UnknownStructrue) => Result<Statement[], CompilingError>

type ParseMessagesProp = (messagesProp: UnknownStructrue) => Result<Statement[], CompilingError>

type ParseMessages = (accStmts: Statement[], messages: Messages, offset: number) =>
    [stmts: typeof accStmts, newOffset: typeof offset]

export const parse: Parse = (jsonlLines) => {
    const results = jsonlLines.map(parseJsonlLine)
    return resultUnity(results)
        .then(stmtsOfStmts => {
            // if staments stream produce by a line of jsonl don't cotains a start statement
            // pre-attend it so analyzer can determine conversation starting
            const fixedStmtsOfStmts = stmtsOfStmts.map(stmts => stmts.at(0)!.type === "start" ? stmts :
                [{ type: "start", mappingInfo: stmts.at(0)!.mappingInfo }, ...stmts]) as Statement[][]
            return resultPass(fixedStmtsOfStmts.flat())
        })
}

const parseJsonlLine: ParseJsonlLine = (jsonlLine) => {
    const value = jsonlLine.value
    const mappingInfo = jsonlLine.mappingInfo
    if (typeof value !== "object") {
        const compilingError: CompilingError = {
            stage: "ParsingError",
            type: "JsonMisform",
            details: "JsonIsNotAnObject",
            mappingInfo
        }
        return resultError(compilingError)
    }
    const valueAsObj = value as object
    const keys = Object.keys(valueAsObj)
    if (keys.length !== 1 && keys.at(0) !== "messages") {
        const compilingError: CompilingError = {
            stage: "ParsingError",
            type: "JsonMisform",
            details: "JsonObjectNotContainsAndOnlyContainsMessagesProp",
            mappingInfo
        }
        return resultError(compilingError)
    }
    const objectOfMessages = valueAsObj as { messages: unknown }
    const messagesProp: UnknownStructrue = {
        value: objectOfMessages.messages,
        mappingInfo
    }
    return parseMessagesProp(messagesProp)
}

const parseMessagesProp: ParseMessagesProp = (messagesProp) => {
    const value = messagesProp.value
    const mappingInfo = messagesProp.mappingInfo
    if (!(value instanceof Array)) {
        const compilingError: CompilingError = {
            stage: "ParsingError",
            type: "JsonMisform",
            details: "JsonObjectMessagesNotArray",
            mappingInfo
        }
        return resultError(compilingError)
    }
    const valueAsArray = value as unknown[]
    if (valueAsArray.length <= 0) {
        const compilingError: CompilingError = {
            stage: "ParsingError",
            type: "JsonMisform",
            details: "JsonObjectMessagesEmpty",
            mappingInfo
        }
        return resultError(compilingError)
    }
    if (!valueAsArray.every(child => typeof child === "object")) {
        const compilingError: CompilingError = {
            stage: "ParsingError",
            type: "JsonMisform",
            details: "JsonObjectMessagesChildNotAllObject",
            mappingInfo
        }
        return resultError(compilingError)
    }
    if (!valueAsArray.every(child => {
        const childAsObj = child as object
        const keys = Object.keys(childAsObj)
        const isKeysMatch = keys.length === 2
            && keys.includes("role")
            && keys.includes("content")
        if (!isKeysMatch) return false
        const childAsMaybeMessage = child as { role: unknown, content: unknown }
        const isKeysTypeCorrect = typeof childAsMaybeMessage.role === "string"
            && typeof childAsMaybeMessage.content === "string"
        if (!isKeysTypeCorrect) return false
        const roleAsString = childAsMaybeMessage.role as string
        const isRoleValid = ["system", "assistant", "user"].includes(roleAsString)
        if (!isRoleValid) return false
        return true
    })) {
        const compilingError: CompilingError = {
            stage: "ParsingError",
            type: "JsonMisform",
            details: "JsonObjectMessagesChildNotAllIsMessage",
            mappingInfo
        }
        return resultError(compilingError)
    }
    const messages = { value: valueAsArray, mappingInfo } as Messages
    const [stmts, _] = parseMessages([], messages, 0)
    return resultPass(stmts)
}

const parseMessages: ParseMessages = (accStmts, messages, offset) => {
    const value = messages.value
    const mappingInfo = messages.mappingInfo
    if (offset >= value.length) return [accStmts, -1]
    const message = value.at(offset)!
    const role = message.role
    // trim whole string and trim by each line
    // make bahavior consistent with hxqa lexer
    const content = message.content
        .trim()
        .split("\n")
        .map(line => line.trim())
        .join("\n")
    const rawStmt =
        role === "system" ? { type: "start", value: content } :
            role === "assistant" ? { type: "output", value: content } :
                { type: "input", value: content }
    const stmt = { ...rawStmt, mappingInfo } as Statement
    const stmts = [...accStmts, stmt]
    return parseMessages(stmts, messages, offset + 1)
}