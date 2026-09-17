/// <reference types="tree-sitter-cli/dsl.d.ts" />
// @ts-check

import {_jsx_element} from 'tree-sitter-javascript/grammar.mjs';
import * as Common from '../common/grammar.mjs';

export const
  expression = rule(() => {
    const previous = Common.expression.body();
    if (previous.type !== 'CHOICE') {
      throw new Error('Expected Common.expression to be a choice');
    }
    return choice(
      ...previous.members.filter(member => !_jsx_element.equals(member)),
      Common.type_assertion,
    );
  });

export default {
  extends: Common,
  name: 'typescript',
  conflicts: Common.default.conflicts.concat([
    [Common.primary_type, Common.type_parameter],
  ]),
};
