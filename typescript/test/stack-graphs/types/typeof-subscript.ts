let x: [{
    g: number;
}];

let y: typeof x[0];
//            ^ defined: 1

  y.g;
//^ defined: 5
//  ^ defined: 2

export {};
