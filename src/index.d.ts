/** Object types that should never be mapped */
type AtomicObject =
    | Function
    | Map<any, any>
    | WeakMap<any, any>
    | Set<any>
    | WeakSet<any>
    | Promise<any>
    | Date
    | RegExp
    | Boolean
    | Number
    | String

/** Use type inference to know when an array is finite */
type IsFinite<T extends any[]> = T extends never[]
    ? true
    : T extends ReadonlyArray<infer U>
    ? (U[] extends T ? false : true)
    : true

export type DraftObject<T> = T extends object
    ? T extends AtomicObject
        ? T
        : {-readonly [P in keyof T]: Draft<T[P]>}
    : T

export type DraftArray<T> = Array<
    T extends ReadonlyArray<any>
        ? {[P in keyof T]: Draft<T>}[keyof T]
        : DraftObject<T>
>

export type DraftTuple<T extends any[]> = {
    [P in keyof T]: T[P] extends T[number] ? Draft<T[P]> : never
}

export type Draft<T> = T extends any[]
    ? IsFinite<T> extends true
        ? DraftTuple<T>
        : DraftArray<T[number]>
    : T extends ReadonlyArray<any>
    ? DraftArray<T[number]>
    : T extends object
    ? DraftObject<T>
    : T

export interface Patch {
    op: "replace" | "remove" | "add"
    path: (string | number)[]
    value?: any
}

export type PatchListener = (patches: Patch[], inversePatches: Patch[]) => void

export interface IProduce {
    /**
     * The `produce` function takes a value and a "recipe function" (whose
     * return value often depends on the base state). The recipe function is
     * free to mutate its first argument however it wants. All mutations are
     * only ever applied to a __copy__ of the base state.
     *
     * Pass only a function to create a "curried producer" which relieves you
     * from passing the recipe function every time.
     *
     * Only plain objects and arrays are made mutable. All other objects are
     * considered uncopyable.
     *
     * Note: This function is __bound__ to its `Immer` instance.
     *
     * @param {any} base - the initial state
     * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
     * @param {Function} patchListener - optional function that will be called with all the patches produced here
     * @returns {any} a new state, or the initial state if nothing was modified
     */
    <S = any>(
        base: S,
        recipe: (this: Draft<S>, draft: Draft<S>) => void | S,
        listener?: PatchListener
    ): S

    // curried invocations with default initial state
    // 0 additional arguments
    <S = any>(
        recipe: (this: Draft<S>, draft: Draft<S>) => void | S,
        defaultBase: S
    ): (base: S | undefined) => S
    // 1 additional argument of type A
    <S = any, A = any>(
        recipe: (this: Draft<S>, draft: Draft<S>, a: A) => void | S,
        defaultBase: S
    ): (base: S | undefined, a: A) => S
    // 2 additional arguments of types A and B
    <S = any, A = any, B = any>(
        recipe: (this: Draft<S>, draft: Draft<S>, a: A, b: B) => void | S,
        defaultBase: S
    ): (base: S | undefined, a: A, b: B) => S
    // 3 additional arguments of types A, B and C
    <S = any, A = any, B = any, C = any>(
        recipe: (this: Draft<S>, draft: Draft<S>, a: A, b: B, c: C) => void | S,
        defaultBase: S
    ): (base: S | undefined, a: A, b: B, c: C) => S
    // any number of additional arguments, but with loss of type safety
    // this may be alleviated if "variadic kinds" makes it into Typescript:
    // https://github.com/Microsoft/TypeScript/issues/5453
    <S = any>(
        recipe: (
            this: Draft<S>,
            draft: Draft<S>,
            ...extraArgs: any[]
        ) => void | S,
        defaultBase: S
    ): (base: S | undefined, ...extraArgs: any[]) => S

    // curried invocations without default initial state
    // 0 additional arguments
    <S = any>(recipe: (this: Draft<S>, draft: Draft<S>) => void | S): (
        base: S
    ) => S
    // 1 additional argument of type A
    <S = any, A = any>(
        recipe: (this: Draft<S>, draft: Draft<S>, a: A) => void | S
    ): (base: S, a: A) => S
    // 2 additional arguments of types A and B
    <S = any, A = any, B = any>(
        recipe: (this: Draft<S>, draft: Draft<S>, a: A, b: B) => void | S
    ): (base: S, a: A, b: B) => S
    // 3 additional arguments of types A, B and C
    <S = any, A = any, B = any, C = any>(
        recipe: (this: Draft<S>, draft: Draft<S>, a: A, b: B, c: C) => void | S
    ): (base: S, a: A, b: B, c: C) => S
    // any number of additional arguments, but with loss of type safety
    // this may be alleviated if "variadic kinds" makes it into Typescript:
    // https://github.com/Microsoft/TypeScript/issues/5453
    <S = any>(
        recipe: (
            this: Draft<S>,
            draft: Draft<S>,
            ...extraArgs: any[]
        ) => void | S
    ): (base: S, ...extraArgs: any[]) => S
}

export const produce: IProduce
export default produce

/**
 * The sentinel value returned by producers to replace the draft with undefined.
 */
export const nothing: undefined

/**
 * Pass true to automatically freeze all copies created by Immer.
 *
 * By default, auto-freezing is disabled in production.
 */
export function setAutoFreeze(autoFreeze: boolean): void

/**
 * Pass true to use the ES2015 `Proxy` class when creating drafts, which is
 * always faster than using ES5 proxies.
 *
 * By default, feature detection is used, so calling this is rarely necessary.
 */
export function setUseProxies(useProxies: boolean): void

/**
 * Apply an array of Immer patches to the first argument.
 *
 * This function is a producer, which means copy-on-write is in effect.
 */
export function applyPatches<S>(base: S, patches: Patch[]): S

export function original<T>(value: T): T | void

export function isDraft(value: any): boolean

export class Immer {
    constructor(config: {
        useProxies?: boolean
        autoFreeze?: boolean
        onAssign?: <T>(state: ImmerState<T>, prop: keyof T, value: any) => void
        onDelete?: <T>(state: ImmerState<T>, prop: keyof T) => void
        onCopy?: <T>(state: ImmerState<T>) => void
    })
    /**
     * The `produce` function takes a value and a "recipe function" (whose
     * return value often depends on the base state). The recipe function is
     * free to mutate its first argument however it wants. All mutations are
     * only ever applied to a __copy__ of the base state.
     *
     * Pass only a function to create a "curried producer" which relieves you
     * from passing the recipe function every time.
     *
     * Only plain objects and arrays are made mutable. All other objects are
     * considered uncopyable.
     *
     * Note: This function is __bound__ to its `Immer` instance.
     *
     * @param {any} base - the initial state
     * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
     * @param {Function} patchListener - optional function that will be called with all the patches produced here
     * @returns {any} a new state, or the initial state if nothing was modified
     */
    produce: IProduce
    /**
     * When true, `produce` will freeze the copies it creates.
     */
    readonly autoFreeze: boolean
    /**
     * When true, drafts are ES2015 proxies.
     */
    readonly useProxies: boolean
    /**
     * Pass true to automatically freeze all copies created by Immer.
     *
     * By default, auto-freezing is disabled in production.
     */
    setAutoFreeze(autoFreeze: boolean): void
    /**
     * Pass true to use the ES2015 `Proxy` class when creating drafts, which is
     * always faster than using ES5 proxies.
     *
     * By default, feature detection is used, so calling this is rarely necessary.
     */
    setUseProxies(useProxies: boolean): void
}

export interface ImmerState<T = any> {
    parent?: ImmerState
    base: T
    copy: T
    assigned: {[prop: string]: boolean}
}