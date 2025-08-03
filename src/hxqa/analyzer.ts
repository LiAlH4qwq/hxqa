import * as hxqaTypes from "./types"
import * as genericTypes from "../types"

export const analyze = (statements: hxqaTypes.Statement[]): genericTypes.AST => {
    const satementsWithoutComments = statements.filter(statement => statement.type !== "comment")
    const ast = tryFormingAST(satementsWithoutComments)
    return ast
}

const tryFormingAST = (statements: hxqaTypes.Statement[]): genericTypes.AST => {
    const conversations = tryFormingConversations(statements)
    const ast = { conversations: conversations }
    return ast
}

const tryFormingConversations = (statements: hxqaTypes.Statement[]): genericTypes.Conversation[] => {
    const [conversation, restStatements] = tryFormingConversation(statements)
    if (restStatements.length <= 0) return [conversation]
    return [conversation, ...tryFormingConversations(restStatements)]
}

const tryFormingConversation = (statements: hxqaTypes.Statement[]): [conversation: genericTypes.Conversation, restStatements: hxqaTypes.Statement[]] => {
    const systemPrompt = statements[0].value
    const [questionAnswerPairs, restStatements] = tryFormingQuestionAnswerPairs(statements.slice(1))
    const conversation = systemPrompt === undefined ?
        { questionAnswerPairs: questionAnswerPairs } :
        { systemPrompt: systemPrompt, questionAnswerPairs: questionAnswerPairs }
    return [conversation, restStatements]
}

const tryFormingQuestionAnswerPairs = (statements: hxqaTypes.Statement[]): [questionAnswerPairs: genericTypes.QuestionAnswerPair[], restStatements: hxqaTypes.Statement[]] => {
    const [currentQuestionAnswerPair, currentRestStatements] = tryFormingQuestionAnswerPair(statements)
    if (currentRestStatements.length <= 0) return [[currentQuestionAnswerPair], currentRestStatements]
    if (currentRestStatements[0].type === "start") return [[currentQuestionAnswerPair], currentRestStatements]
    const [nextQuestionAnswerPairs, nextRestStatements] = tryFormingQuestionAnswerPairs(currentRestStatements)
    return [[currentQuestionAnswerPair, ...nextQuestionAnswerPairs], nextRestStatements]
}

const tryFormingQuestionAnswerPair = (statements: hxqaTypes.Statement[]): [questionAnswerPair: genericTypes.QuestionAnswerPair, restStatements: hxqaTypes.Statement[]] => {
    const question = statements[0].value as string
    const answer = statements[1].value as string
    const questionAnswerPair = { question: question, answer: answer }
    return [questionAnswerPair, statements.slice(2)]
}