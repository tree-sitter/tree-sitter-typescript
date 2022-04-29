/*--- path: ModA.ts ---*/

export = A;

class A {
    f = 42;
};

/*--- path: ModB.ts ---*/

import A = require('./ModA');

let a: A = new A();
//     ^ defined: 11, 5
//             ^ defined: 11, 5

  a.f;
//^ defined: 13
//  ^ defined: 6