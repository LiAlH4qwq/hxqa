import * as types from "./types"

export const lex = (hxqa: string): types.Token[] => {
    const lexLine = (line: string): types.Token[] => {
        if (line === ":::") return [
            { type: "startId" },
            { type: "newLine" }
        ]
        else if (line === "<<<") return [
            { type: "inputId" },
            { type: "newLine" }
        ]
        else if (line === ">>>") return [
            { type: "outputId" },
            { type: "newLine" }
        ]
        else if (line === "///") return [
            { type: "commentId" },
            { type: "newLine" }
        ]
        else if (line.startsWith(":::")) return [
            { type: "startId" },
            { type: "text", text: line.slice(3).trimStart() },
            { type: "newLine" }
        ]
        else if (line.startsWith("<<<")) return [
            { type: "inputId" },
            { type: "text", text: line.slice(3).trimStart() },
            { type: "newLine" }
        ]
        else if (line.startsWith(">>>")) return [
            { type: "outputId" },
            { type: "text", text: line.slice(3).trimStart() },
            { type: "newLine" }
        ]
        else if (line.startsWith("///")) return [
            { type: "commentId" },
            { type: "text", text: line.slice(3).trimStart() },
            { type: "newLine" }
        ]
        else return [
            { type: "text", text: line },
            { type: "newLine" }
        ]
    }

    const trimedHxqa = hxqa.trim()
    const lines = trimedHxqa.split("\n")
    const trimedLines = lines.map(line => line.trim())
    const tokensInLines = trimedLines.map(lexLine)
    const tokens = tokensInLines.flat()
    return tokens
}