import * as types from "./types"

export const lex = (hxqa: string): types.Token[] => {
    const lines = hxqa.split("\n")
    const tokensInLines = lines.map((line, lineIndex) => lexLine(line, lineIndex + 1))
    const tokensInLinesFiltered = tokensInLines.filter(tokens => tokens[0].type != "empty")
    const tokens = tokensInLinesFiltered.flat()
    return tokens
}

const lexLine = (line: string, lineNum: number): types.Token[] => {
    const trimedLine = line.trim()
    if (trimedLine === "") return [{ type: "empty" }]
    else if (trimedLine === ":::") {
        const columnStart = line.indexOf(":::") + 1
        return [
            {
                type: "startId",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: columnStart,
                    columnEnd: columnStart + 3
                }
            },
            {
                type: "newLine",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: line.length + 1,
                    columnEnd: line.length + 1
                }
            }
        ]
    }
    else if (trimedLine === "<<<") {
        const columnStart = line.indexOf("<<<") + 1
        return [
            {
                type: "inputId",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: columnStart,
                    columnEnd: columnStart + 3
                }
            },
            {
                type: "newLine",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: line.length + 1,
                    columnEnd: line.length + 1
                }
            }
        ]
    }
    else if (trimedLine === ">>>") {
        const columnStart = line.indexOf(">>>") + 1
        return [
            {
                type: "outputId",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: columnStart,
                    columnEnd: columnStart + 3
                }
            },
            {
                type: "newLine",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: line.length + 1,
                    columnEnd: line.length + 1
                }
            }
        ]
    }
    else if (trimedLine === "///") {
        const columnStart = line.indexOf("///") + 1
        return [
            {
                type: "commentId",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: columnStart,
                    columnEnd: columnStart + 3
                }
            },
            {
                type: "newLine",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: line.length + 1,
                    columnEnd: line.length + 1
                }
            }
        ]
    }
    else if (trimedLine.startsWith(":::")) {
        const content = trimedLine.slice(3).trim()
        const idColumnStart = line.indexOf(":::") + 1
        const contentColumnStart = line.indexOf(content) + 1
        return [
            {
                type: "startId",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: idColumnStart,
                    columnEnd: idColumnStart + 3
                }
            },
            {
                type: "content",
                value: content,
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: contentColumnStart,
                    columnEnd: contentColumnStart + content.length
                }
            },
            {
                type: "newLine",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: line.length + 1,
                    columnEnd: line.length + 1
                }
            }
        ]
    }
    else if (trimedLine.startsWith("<<<")) {
        const content = trimedLine.slice(3).trim()
        const idColumnStart = line.indexOf("<<<") + 1
        const contentColumnStart = line.indexOf(content) + 1
        return [
            {
                type: "inputId",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: idColumnStart,
                    columnEnd: idColumnStart + 3
                }
            },
            {
                type: "content",
                value: content,
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: contentColumnStart,
                    columnEnd: contentColumnStart + content.length
                }
            },
            {
                type: "newLine",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: line.length + 1,
                    columnEnd: line.length + 1
                }
            }
        ]
    }
    else if (trimedLine.startsWith(">>>")) {
        const content = trimedLine.slice(3).trim()
        const idColumnStart = line.indexOf(">>>") + 1
        const contentColumnStart = line.indexOf(content) + 1
        return [
            {
                type: "outputId",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: idColumnStart,
                    columnEnd: idColumnStart + 3
                }
            },
            {
                type: "content",
                value: content,
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: contentColumnStart,
                    columnEnd: contentColumnStart + content.length
                }
            },
            {
                type: "newLine",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: line.length + 1,
                    columnEnd: line.length + 1
                }
            }
        ]
    }
    else if (trimedLine.startsWith("///")) {
        const content = trimedLine.slice(3).trim()
        const idColumnStart = line.indexOf("///") + 1
        const contentColumnStart = line.indexOf(content) + 1
        return [
            {
                type: "commentId",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: idColumnStart,
                    columnEnd: idColumnStart + 3
                }
            },
            {
                type: "content",
                value: content,
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: contentColumnStart,
                    columnEnd: contentColumnStart + content.length
                }
            },
            {
                type: "newLine",
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: line.length + 1,
                    columnEnd: line.length + 1
                }
            }
        ]
    }
    else {
        const columnStart = line.indexOf(trimedLine) + 1
        return [
            {
                type: "content",
                value: trimedLine,
                mappingInfo: {
                    lineStart: lineNum,
                    lineEnd: lineNum,
                    columnStart: columnStart,
                    columnEnd: columnStart + trimedLine.length
                }
            }
        ]
    }
}