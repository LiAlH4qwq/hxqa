export type Result<V, E> = {
    pass: true
    value: V
    out: () => V
    then: <T, A>(f: (value: V) => Result<T, A>) => Result<T, A>
} | {
    pass: false
    error: E
    out: () => E
    then: <T, A>(f: (value: V) => Result<T, A>) => Result<never, E>
}
export const resultPass = <V>(value: V): Result<V, never> => {
    return {
        pass: true,
        value: value,
        out: () => value,
        then: <T, E>(f: (value: V) => Result<T, E>) => f(value)
    }
}
export const resultError = <E>(error: E): Result<never, E> => {
    return {
        pass: false,
        error: error,
        out: () => error,
        then: () => resultError(error)
    }
}