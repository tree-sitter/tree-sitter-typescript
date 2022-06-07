var this_ = ``;
var isCorrect = `foo`;
type ButThis = ``; //<- first backtick is misparsed
type IsWrong = `foo`;

// Um... So I'm in a template string or what?

var value = `type A = string`; //<- second backtick is misparsed
