type T = import("mod").Foo<string>;
const x: import("mod").Foo<string> = undefined;
type P = (import("mod").Foo);
type I = import("mod").Foo["bar"];
type A = import("mod").Foo[];
type K = import("mod")["k"];
type N = Promise<import("mod").Foo>;
