export type Token = |
    ({ type: "newLine" } |
    { type: "startId" } |
    { type: "inputId" } |
    { type: "outputId" } |
    // TODO: { type: "referenceId" } |
    { type: "commentId" } |
    { type: "content", value: string }) &
    { mappingInfo: MappingInfo }

export type Statement =
    ({ type: "start", value?: string } |
    { type: "input", value: string } |
    { type: "output", value: string } |
    { type: "comment", value?: string }) &
    { mappingInfo: MappingInfo }

export type MappingInfo = {
    lineStart: number
    lineEnd: number
    columnStart: number
    columnEnd: number
}