const hxqa2jsonl = (hxqa: string) => {
    const hxqaPart2json = (hxqaPart: string) => {
        type Builder = {
            buffer: string[]
            texts: string[]
            markers: string[]
        }
        const lines = hxqaPart.split("\n").map(line => line.trim())
        const builder = lines.reduce((oldBuilder, line) => {
            const newBuilder = { ...oldBuilder }
            if (["<<<", ">>>"].includes(line)) {
                newBuilder.markers.push(line)
                newBuilder.texts.push(oldBuilder.buffer.join("\n").trim())
                newBuilder.buffer = []
            } else {
                newBuilder.buffer.push(line)
            }
            return newBuilder
        }, {
            buffer: [],
            texts: [],
            markers: []
        } as Builder)
        if (!builder.markers.every((marker, index) => marker === (index % 2 === 0 ? "<<<" : ">>>"))) throw new Error("Q-A must be alternating and Q must be first!")
        builder.texts.push(builder.buffer.join("\n"))
        const systemPrompt = builder.texts[0]
        const texts = builder.texts.slice(1)
        type Message = {
            role: "system" | "user" | "assistant"
            content: string
        }
        const messages = [] as Message[]
        if (systemPrompt != "") messages.push({
            role: "system",
            content: systemPrompt
        })
        texts.map((text, index) => messages.push({
            role: index % 2 === 0 ? "user" : "assistant",
            content: text
        }))
        const json = JSON.stringify({ messages: messages })
        return json
    }
    const hxqaParts = hxqa.split(":::").map(part => part.trim()).filter(part => part != "")
    const jsonl = hxqaParts.map(hxqaPart2json).join("\n")
    return jsonl
}

/* import * as fs from "fs"
const hxqa = fs.readFileSync("hxqa.txt", "utf-8")
const jsonl = hxqa2jsonl(hxqa)
fs.writeFileSync("qa.jsonl", jsonl, "utf-8") */