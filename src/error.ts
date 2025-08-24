export type Result<V, E> = {
    pass: true
    value: V
    out: () => V
    then: <T, A>(f: (value: V) => Result<T, A>) => Result<T, A>
    transError: <T>(f: (error: E) => T) => Result<V, never>
} | {
    pass: false
    error: E
    out: () => E
    then: <T, A>(f: (value: V) => Result<T, A>) => Result<never, E>
    transError: <T>(f: (error: E) => T) => Result<never, T>
}

export type SolidResult<V, E> = {
    pass: true
    value: V
} | {
    pass: false
    error: E
}

type ResultPass = <V>(value: V) => Result<V, never>

type ResultError = <E>(error: E) => Result<never, E>

type ResultUnity = <V, E>(results: Result<V, E>[]) =>
    Result<V[], E[]>

type ResultSolid = <V, E>(result: Result<V, E>) => SolidResult<V, E>

export const resultPass: ResultPass = (value) => {
    return {
        pass: true,
        value: value,
        out: () => value,
        then: (f) => f(value),
        transError: (_) => resultPass(value)
    }
}
export const resultError: ResultError = (error) => {
    return {
        pass: false,
        error: error,
        out: () => error,
        then: (_) => resultError(error),
        transError: (f) => resultError(f(error))
    }
}

export const resultUnity: ResultUnity = <V, E>(results: Result<V, E>[]) => {
    const errorResults = results.filter(result => !result.pass) as Result<never, E>[]
    if (errorResults.length >= 1) return resultError(errorResults.map(errorResult => errorResult.out()))
    return resultPass(results.map(passResult => passResult.out())) as Result<V[], never>
}

export const resultSolid: ResultSolid = <V, E>(result: Result<V, E>) => {
    if (result.pass) return {
        pass: true,
        value: result.out()
    }
    return {
        pass: false,
        error: result.out() as E
    }
}