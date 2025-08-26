import { MappingInfo } from "@/types"

export type UnknownStructrue = {
    value: unknown
    mappingInfo: MappingInfo
}

export type Messages = {
    value: Message[]
    mappingInfo: MappingInfo
}

export type Conversation = {
    messages: Message[]
}

export type Message = {
    role: "system" | "user" | "assistant"
    content: string
}