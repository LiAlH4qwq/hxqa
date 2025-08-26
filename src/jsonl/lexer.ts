import { Result, resultPass, resultError, resultUnity } from "@/error"
import { CompilingError, MappingInfo } from "@/types"
import { UnknownStructrue } from "@jsonl/types"

type Lex = (jsonl: string) => Result<UnknownStructrue[], CompilingError[]>

type LexJsonlLine = (line: string, lineNum: number, lineLength: number) =>
    Result<UnknownStructrue, CompilingError>

type JsonToObject = (json: string) => Result<unknown, {}>

export const lex: Lex = (jsonl) => {
    const jsonlLines = jsonl.split("\n")
    const results =
        jsonlLines.map((jsonlLine, jsonlLineIndex) =>
            lexJsonlLine(jsonlLine, jsonlLineIndex + 1, jsonlLine.length))
    return resultUnity(results)
}

const lexJsonlLine: LexJsonlLine = (line, lineNum, lineLength) => {
    const mappingInfo: MappingInfo = {
        lineStart: lineNum,
        lineEnd: lineNum,
        columnStart: 0,
        columnEnd: lineLength
    }
    const result = jsonToObject(line)
    return result
        .then(value => {
            const jsonlLine: UnknownStructrue = {
                value,
                mappingInfo
            }
            return resultPass(jsonlLine)
        }).transError(_ => {
            const compilingError: CompilingError = {
                stage: "LexingError",
                type: "JsonlMisform",
                details: "LineIsNotValidJson",
                mappingInfo
            }
            return compilingError
        })
}

const jsonToObject: JsonToObject = (json) => {
    try {
        const value = JSON.parse(json) as unknown
        return resultPass(value)
    } catch {
        return resultError({})
    }
}