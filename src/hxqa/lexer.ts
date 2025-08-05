import * as error from "src/error"
import * as types from "hxqa/types"

type Lex = (hxqa: string) => error.Result<types.Token[], never>

type LexLine = (line: string, lineNum: number) => types.Token[]

type TokenNoValue = (
    id: "\n" | ":::" | "<<<" | ">>>" | "///",
    lineStart: number, lineEnd: number, columnStart: number, columnEnd: number
) => types.Token

type TokenContent = (
    value: string,
    lineStart: number, lineEnd: number, columnStart: number, columnEnd: number
) => types.Token

export const lex: Lex = (hxqa) => {
    const lines = hxqa.split("\n")
    const tokensInLines = lines.map((line, lineIndex) => lexLine(line, lineIndex + 1))
    const tokens = tokensInLines.flat()
    return error.resultPass(tokens)
}

const lexLine: LexLine = (line, lineNum) => {
    const ids = [":::", "<<<", ">>>", "///"]
    const trimedLine = line.trim()
    if (trimedLine === "") return [
        tokenNoValue("\n", lineNum, lineNum, 0, 0)
    ]
    else if (ids.includes(trimedLine)) {
        const id = trimedLine as ":::" | "<<<" | ">>>" | "///"
        const idColumnStart = line.indexOf(id) + 1
        return [
            tokenNoValue(id, lineNum, lineNum, idColumnStart, idColumnStart + 2),
            tokenNoValue("\n", lineNum, lineNum, line.length + 1, line.length + 1)
        ]
    }
    else if (ids.includes(trimedLine.slice(0, 3))) {
        const id = trimedLine.slice(0, 3) as ":::" | "<<<" | ">>>" | "///"
        const idColumnStart = line.indexOf(id) + 1
        const content = trimedLine.slice(3).trim()
        const contentColumnStart = line.indexOf(content) + 1
        return [
            tokenNoValue(id, lineNum, lineNum, idColumnStart, idColumnStart + 2),
            tokenContent(content, lineNum, lineNum, contentColumnStart, contentColumnStart + content.length - 1),
            tokenNoValue("\n", lineNum, lineNum, line.length + 1, line.length + 1)
        ]
    }
    else {
        const contentColumnStart = line.indexOf(trimedLine) + 1
        return [
            tokenContent(trimedLine, lineNum, lineNum, contentColumnStart, contentColumnStart + trimedLine.length - 1),
            tokenNoValue("\n", lineNum, lineNum, line.length + 1, line.length + 1)
        ]
    }
}

const tokenNoValue: TokenNoValue = (id, lineStart, lineEnd, columnStart, columnEnd) => {
    return {
        type: id === "\n" ? "newLine" :
            id === ":::" ? "startId" :
                id === "<<<" ? "inputId" :
                    id === ">>>" ? "outputId" :
                        "commentId",
        mappingInfo: {
            lineStart: lineStart,
            lineEnd: lineEnd,
            columnStart: columnStart,
            columnEnd: columnEnd
        }
    }
}

const tokenContent: TokenContent = (value, lineStart, lineEnd, columnStart, columnEnd) => {
    return {
        type: "content",
        value: value,
        mappingInfo: {
            lineStart: lineStart,
            lineEnd: lineEnd,
            columnStart: columnStart,
            columnEnd: columnEnd
        }
    }
}