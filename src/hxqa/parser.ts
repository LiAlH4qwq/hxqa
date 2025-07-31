import * as types from "./types"

export const parse = (tokens: types.Token[]): types.Statement[] => {
    const tryFormingStatements = (tokens: types.Token[]): types.Statement[] => {
        const tryFormingStatement = (tokens: types.Token[]): [statement: types.Statement, restTokens: types.Token[]] => {
            const tryCollectingText = (tokens: types.Token[]): [text: string, restTokens: types.Token[]] => {
                if (tokens.length <= 0) return ["", tokens]
                if (!(tokens[0].type === "text" || tokens[0].type === "newLine")) return ["", tokens]
                const currentText = tokens[0].type === "newLine" ? "\n" : tokens[0].text
                const [nextText, restTokens] = tryCollectingText(tokens.slice(1))
                const text = currentText + nextText
                return [text, restTokens]
            }
            const tryFormingConversationStartStatement = (tokens: types.Token[]): [statement: types.Statement, restTokens: types.Token[]] => {
                const [text, restTokens] = tryCollectingText(tokens)
                if (text.trim() === "") return [{ type: "conversationStart" }, restTokens]
                else return [{ type: "conversationStart", content: text.trim() }, restTokens]
            }
            const tryFormingInputStatement = (tokens: types.Token[]): [statement: types.Statement, restTokens: types.Token[]] => {
                const [text, restTokens] = tryCollectingText(tokens)
                return [{ type: "input", content: text.trim() }, restTokens]
            }
            const tryFormingOutputStatement = (tokens: types.Token[]): [statement: types.Statement, restTokens: types.Token[]] => {
                const [text, restTokens] = tryCollectingText(tokens)
                return [{ type: "output", content: text.trim() }, restTokens]
            }
            const tryFormingCommentStatement = (tokens: types.Token[]): [statement: types.Statement, restTokens: types.Token[]] => {
                const [text, restTokens] = tryCollectingText(tokens)
                return [{ type: "comment", content: text.trim() }, restTokens]
            }
            if (tokens[0].type === "startId") return tryFormingConversationStartStatement(tokens.slice(1))
            else if (tokens[0].type === "inputId") return tryFormingInputStatement(tokens.slice(1))
            else if (tokens[0].type === "outputId") return tryFormingOutputStatement(tokens.slice(1))
            else if (tokens[0].type === "commentId") return tryFormingCommentStatement(tokens.slice(1))
            else return tryFormingCommentStatement(tokens.slice(1))
        }
        const [statement, restTokens] = tryFormingStatement(tokens)
        if (restTokens.length <= 0) return [statement]
        else return [statement, ...tryFormingStatements(restTokens)]
    }
    const statements = tryFormingStatements(tokens)
    return statements
}