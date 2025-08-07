export type JsonlLine = {
    messages: Message[]
}

export type Message = {
    role: "system" | "user" | "assistant"
    content: string
}