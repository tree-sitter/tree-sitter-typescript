type A<B extends string, C>
  = B extends `${any}:${infer T}` ? T extends D ? E[T] : F : F
type G<B extends string, C>
  = B extends `${infer L}${X}${infer R}` ? `${L}${Y}${Replace<R, X, Y>}` : B
type H<B extends string, C>
  = B extends `${infer L}]${infer R}` ? [ParamType<L, K>, ...ExtractAll<R, K>] : []
