import { MappingInfo } from "@/types"

export type Token = |
    ({ type: "newLine" } |
    { type: "startId" } |
    { type: "inputId" } |
    { type: "outputId" } |
    // TODO: { type: "referenceId" } |
    { type: "commentId" } |
    { type: "content", value: string }) &
    { mappingInfo: MappingInfo }