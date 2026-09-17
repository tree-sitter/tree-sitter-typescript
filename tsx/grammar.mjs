/// <reference types="tree-sitter-cli/dsl.d.ts" />
// @ts-check

import * as JavaScript from 'tree-sitter-javascript/grammar.mjs';
import * as Common from '../common/grammar.mjs';

export default {
  extends: Common,
  name: 'tsx',
  conflicts: Common.default.conflicts.concat([
    [Common.jsx_opening_element, Common.type_parameter],
    [JavaScript.jsx_namespace_name, Common.primary_type],
  ]),
};
