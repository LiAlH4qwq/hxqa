export type Result<V, E> = {
    pass: true
    value: V
    out: () => V
    then: <T, A>(f: (value: V) => Result<T, never> | Result<never, A>) => Result<T, never> | Result<never, A>
    transError: <T>(f: (error: E) => T) => Result<V, never>
} | {
    pass: false
    error: E
    out: () => E
    then: <T, A>(f: (value: V) => Result<T, never> | Result<never, A>) => Result<never, E>
    transError: <T>(f: (error: E) => T) => Result<never, T>
}

type ResultPass = <V>(value: V) => Result<V, never>

type ResultError = <E>(error: E) => Result<never, E>

type ResultUnity = <V, E>(results: (Result<V, never> | Result<never, E>)[]) =>
    Result<V[], never> | Result<never, E[]>

export const resultPass: ResultPass = <V, E>(value: V) => {
    return {
        pass: true,
        value: value,
        out: () => value,
        then: <T, A>(f: (value: V) => Result<T, never> | Result<never, A>) => f(value),
        transError: <T>(_: (error: E) => T) => resultPass(value)
    }
}
export const resultError: ResultError = <V, E>(error: E) => {
    return {
        pass: false,
        error: error,
        out: () => error,
        then: <T, A>(_: (value: V) => Result<T, never> | Result<never, A>) => resultError(error),
        transError: <T>(f: (error: E) => T) => resultError(f(error))
    }
}

export const resultUnity: ResultUnity = <V, E>(results: (Result<V, never> | Result<never, E>)[]) => {
    const errorResults = results.filter(result => !result.pass) as Result<never, E>[]
    if (errorResults.length >= 1) return resultError(errorResults.map(errorResult => errorResult.out()))
    const passResults = results as Result<V, never>[]
    return resultPass(passResults.map(passResult => passResult.out()))
}