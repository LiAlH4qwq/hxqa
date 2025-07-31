export type Token =
    { type: "space" } |
    { type: "newLine" } |
    { type: "startId" } |
    { type: "inputId" } |
    { type: "outputId" } |
    // TODO: { type: "referenceId" } |
    { type: "commentId" } |
    { type: "text", text: string }

export type Statement =
    { type: "conversationStart", content?: string } |
    { type: "input", content: string } |
    { type: "output", content: string } |
    { type: "comment", content?: string }