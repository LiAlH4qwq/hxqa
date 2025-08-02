export type Token =
    { type: "empty" } |
    { type: "newLine", mappingInfo: MappingInfo } |
    { type: "startId", mappingInfo: MappingInfo } |
    { type: "inputId", mappingInfo: MappingInfo } |
    { type: "outputId", mappingInfo: MappingInfo } |
    // TODO: { type: "referenceId", mappingInfo: MappingInfo } |
    { type: "commentId", mappingInfo: MappingInfo } |
    { type: "content", value: string, mappingInfo: MappingInfo }

export type Statement =
    { type: "start", content?: string } |
    { type: "input", content: string } |
    { type: "output", content: string } |
    { type: "comment", content?: string }

export type MappingInfo = {
    lineStart: number
    lineEnd: number
    columnStart: number
    columnEnd: number
}