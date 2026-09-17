/// <reference types="tree-sitter-cli/dsl.d.ts" />
// @ts-check

import * as JavaScript from 'tree-sitter-javascript/grammar.mjs';

export const
  public_field_definition = rule(() => seq(
    repeat(field('decorator', decorator)),
    optional(choice(
      seq('declare', optional(accessibility_modifier)),
      seq(accessibility_modifier, optional('declare')),
    )),
    choice(
      seq(optional('static'), optional(override_modifier), optional('readonly')),
      seq(optional('abstract'), optional('readonly')),
      seq(optional('readonly'), optional('abstract')),
      optional('accessor'),
    ),
    field('name', JavaScript._property_name),
    optional(choice('?', '!')),
    field('type', optional(type_annotation)),
    optional(JavaScript._initializer),
  )),

  // override original catch_clause, add optional type annotation
  catch_clause = rule(() => seq(
    'catch',
    optional(
      seq(
        '(',
        field(
          'parameter',
          choice(JavaScript.identifier, JavaScript._destructuring_pattern),
        ),
        optional(
          // only types that resolve to 'any' or 'unknown' are supported
          // by the language but it's simpler to accept any type here.
          field('type', type_annotation),
        ),
        ')',
      ),
    ),
    field('body', JavaScript.statement_block),
  )),

  call_expression = rule(() => choice(
    prec('call', seq(
      field('function', choice(expression, JavaScript.import_)),
      field('type_arguments', optional(type_arguments)),
      field('arguments', JavaScript.arguments_),
    )),
    prec('template_call', seq(
      field('function', choice(primary_expression, new_expression)),
      field('arguments', JavaScript.template_string),
    )),
    prec('member', seq(
      field('function', primary_expression),
      '?.',
      field('type_arguments', optional(type_arguments)),
      field('arguments', JavaScript.arguments_),
    )),
  )),

  new_expression = rule(() => prec.right('new', seq(
    'new',
    field('constructor', primary_expression),
    field('type_arguments', optional(type_arguments)),
    field('arguments', optional(JavaScript.arguments_)),
  ))),

  // Using declarations are inherited from JavaScript, not an assignment prefix.
  assignment_expression = rule(() => prec.right('assign', seq(
    field('left', choice(parenthesized_expression, _lhs_expression)),
    '=',
    field('right', expression),
  ))),

  _augmented_assignment_lhs = rule(() => choice(JavaScript._augmented_assignment_lhs.body(), non_null_expression)),

  _lhs_expression = rule(() => choice(JavaScript._lhs_expression.body(), non_null_expression)),

  primary_expression = rule(() => choice(
    JavaScript.primary_expression.body(),
    non_null_expression,
  )),

  // The shared expression includes JSX. TypeScript replaces it with type assertions.
  expression = rule(() => {
    const previous = JavaScript.expression.body();
    if (previous.type !== 'CHOICE') {
      throw new Error('Expected JavaScript.expression to be a choice');
    }
    return choice(
      as_expression,
      satisfies_expression,
      instantiation_expression,
      internal_module,
      ...previous.members,
    );
  }),

  _jsx_start_opening_element = rule(() => seq(
    '<',
    optional(
      seq(
        choice(
          field('name', choice(
            JavaScript._jsx_identifier,
            JavaScript.jsx_namespace_name,
          )),
          seq(
            field('name', choice(
              JavaScript.identifier,
              alias(JavaScript.nested_identifier, JavaScript.member_expression),
            )),
            field('type_arguments', optional(type_arguments)),
          ),
        ),
        repeat(field('attribute', JavaScript._jsx_attribute)),
      ),
    ),
  )),

  // This rule is only referenced by expression when the dialect is 'tsx'
  jsx_opening_element = rule(() => prec.dynamic(-1, seq(
    _jsx_start_opening_element,
    '>',
  ))),

  // tsx only. See jsx_opening_element.
  jsx_self_closing_element = rule(() => prec.dynamic(-1, seq(
    _jsx_start_opening_element,
    '/>',
  ))),

  export_specifier = rule(() => seq(
    optional(choice('type', 'typeof')),
    JavaScript.export_specifier.body(),
  )),

  _import_identifier = rule(() => choice(JavaScript.identifier, alias('type', JavaScript.identifier))),

  import_specifier = rule(() => seq(
    optional(choice('type', 'typeof')),
    choice(
      field('name', _import_identifier),
      seq(
        field('name', choice(JavaScript._module_export_name, alias('type', JavaScript.identifier))),
        'as',
        field('alias', _import_identifier),
      ),
    ),
  )),

  import_attribute = rule(() => seq(choice('with', 'assert'), JavaScript.object)),

  import_clause = rule(() => choice(
    JavaScript.namespace_import,
    JavaScript.named_imports,
    seq(
      _import_identifier,
      optional(seq(
        ',',
        choice(
          JavaScript.namespace_import,
          JavaScript.named_imports,
        ),
      )),
    ),
  )),

  import_statement = rule(() => seq(
    'import',
    optional(choice('type', 'typeof')),
    choice(
      seq(import_clause, JavaScript._from_clause),
      import_require_clause,
      field('source', JavaScript.string),
    ),
    optional(import_attribute),
    JavaScript._semicolon,
  )),

  export_statement = rule(() => choice(
    JavaScript.export_statement.body(),
    seq(
      'export',
      'type',
      JavaScript.export_clause,
      optional(JavaScript._from_clause),
      JavaScript._semicolon,
    ),
    seq('export', '=', expression, JavaScript._semicolon),
    seq('export', 'as', 'namespace', JavaScript.identifier, JavaScript._semicolon),
  )),

  non_null_expression = rule(() => prec.left('unary', seq(
    expression, '!',
  ))),

  variable_declarator = rule(() => choice(
    seq(
      field('name', choice(JavaScript.identifier, JavaScript._destructuring_pattern)),
      field('type', optional(type_annotation)),
      optional(JavaScript._initializer),
    ),
    prec('declaration', seq(
      field('name', JavaScript.identifier),
      '!',
      field('type', type_annotation),
    )),
  )),

  method_signature = rule(() => seq(
    optional(accessibility_modifier),
    optional('static'),
    optional(override_modifier),
    optional('readonly'),
    optional('async'),
    optional(choice('get', 'set', '*')),
    field('name', JavaScript._property_name),
    optional('?'),
    _call_signature,
  )),

  abstract_method_signature = rule(() => seq(
    optional(accessibility_modifier),
    'abstract',
    optional(override_modifier),
    optional(choice('get', 'set', '*')),
    field('name', JavaScript._property_name),
    optional('?'),
    _call_signature,
  )),

  parenthesized_expression = rule(() => seq(
    '(',
    choice(
      seq(expression, field('type', optional(type_annotation))),
      JavaScript.sequence_expression,
    ),
    ')',
  )),

  _formal_parameter = rule(() => choice(
    required_parameter,
    optional_parameter,
  )),

  function_signature = rule(() => seq(
    optional('async'),
    'function',
    field('name', JavaScript.identifier),
    _call_signature,
    choice(JavaScript._semicolon, _function_signature_automatic_semicolon),
  )),

  decorator = rule(() => seq(
    '@',
    choice(
      JavaScript.identifier,
      alias(decorator_member_expression, JavaScript.member_expression),
      alias(decorator_call_expression, call_expression),
      alias(decorator_parenthesized_expression, parenthesized_expression),
    ),
  )),

  // JavaScript reserves `super`; TypeScript also permits it in decorator members.
  decorator_member_expression = rule(() => prec('member', seq(
    field('object', choice(
      JavaScript.identifier,
      alias(JavaScript.super_, JavaScript.identifier),
      alias(decorator_member_expression, JavaScript.member_expression),
    )),
    '.',
    field('property', alias(JavaScript.identifier, JavaScript.property_identifier)),
  ))),

  decorator_call_expression = rule(() => prec('call', seq(
    field('function', choice(
      JavaScript.identifier,
      alias(decorator_member_expression, JavaScript.member_expression),
    )),
    optional(field('type_arguments', type_arguments)),
    field('arguments', JavaScript.arguments_),
  ))),

  decorator_parenthesized_expression = rule(() => seq(
    '(',
    choice(
      JavaScript.identifier,
      alias(decorator_member_expression, JavaScript.member_expression),
      alias(decorator_call_expression, call_expression),
    ),
    ')',
  )),

  class_body = rule(() => seq(
    '{',
    repeat(choice(
      seq(
        repeat(field('decorator', decorator)),
        method_definition,
        optional(JavaScript._semicolon),
      ),
      // As it happens for functions, the semicolon insertion should not
      // happen if a block follows the closing paren, because then it's a
      // *definition*, not a declaration. Example:
      //     public foo()
      //     { <--- this brace made the method signature become a definition
      //     }
      // The same rule applies for functions and that's why we use
      // "_function_signature_automatic_semicolon".
      seq(method_signature, choice(_function_signature_automatic_semicolon, ',')),
      JavaScript.class_static_block,
      seq(
        choice(
          abstract_method_signature,
          index_signature,
          method_signature,
          public_field_definition,
        ),
        choice(JavaScript._semicolon, ','),
      ),
      ';',
    )),
    '}',
  )),

  method_definition = rule(() => prec.left(seq(
    optional(accessibility_modifier),
    optional('static'),
    optional(override_modifier),
    optional('readonly'),
    optional('async'),
    optional(choice('get', 'set', '*')),
    field('name', JavaScript._property_name),
    optional('?'),
    _call_signature,
    field('body', JavaScript.statement_block),
  ))),

  declaration = rule(() => choice(
    JavaScript.declaration.body(),
    function_signature,
    abstract_class_declaration,
    module,
    prec('declaration', internal_module),
    type_alias_declaration,
    enum_declaration,
    interface_declaration,
    import_alias,
    ambient_declaration,
  )),

  type_assertion = rule(() => prec.left('unary', seq(
    type_arguments,
    expression,
  ))),

  as_expression = rule(() => prec.left('binary', seq(
    expression,
    'as',
    choice('const', type),
  ))),

  satisfies_expression = rule(() => prec.left('binary', seq(
    expression,
    'satisfies',
    type,
  ))),

  instantiation_expression = rule(() => prec('instantiation', seq(
    expression,
    field('type_arguments', type_arguments),
  ))),

  class_heritage = rule(() => choice(
    seq(extends_clause, optional(implements_clause)),
    implements_clause,
  )),

  import_require_clause = rule(() => seq(
    JavaScript.identifier,
    '=',
    'require',
    '(',
    field('source', JavaScript.string),
    ')',
  )),

  extends_clause = rule(() => seq(
    'extends',
    commaSep1(_extends_clause_single),
  )),

  _extends_clause_single = rule(() => prec('extends', seq(
    field('value', expression),
    field('type_arguments', optional(type_arguments)),
  ))),

  implements_clause = rule(() => seq(
    'implements',
    commaSep1(type),
  )),

  ambient_declaration = rule(() => seq(
    'declare',
    choice(
      declaration,
      seq('global', JavaScript.statement_block),
      seq('module', '.', alias(JavaScript.identifier, JavaScript.property_identifier), ':', type, JavaScript._semicolon),
    ),
  )),

  class_ = rule(() => prec('literal', seq(
    repeat(field('decorator', decorator)),
    'class',
    field('name', optional(_type_identifier)),
    field('type_parameters', optional(type_parameters)),
    optional(class_heritage),
    field('body', class_body),
  ))),

  abstract_class_declaration = rule(() => prec('declaration', seq(
    repeat(field('decorator', decorator)),
    'abstract',
    'class',
    field('name', _type_identifier),
    field('type_parameters', optional(type_parameters)),
    optional(class_heritage),
    field('body', class_body),
  ))),

  class_declaration = rule(() => prec.left('declaration', seq(
    repeat(field('decorator', decorator)),
    'class',
    field('name', _type_identifier),
    field('type_parameters', optional(type_parameters)),
    optional(class_heritage),
    field('body', class_body),
    optional(JavaScript._automatic_semicolon),
  ))),

  module = rule(() => seq(
    'module',
    _module,
  )),

  internal_module = rule(() => seq(
    'namespace',
    _module,
  )),

  _module = rule(() => prec.right(seq(
    field('name', choice(JavaScript.string, JavaScript.identifier, JavaScript.nested_identifier)),
    // On .d.ts files "declare module foo" desugars to "declare module foo {}",
    // hence why it is optional here
    field('body', optional(JavaScript.statement_block)),
  ))),

  import_alias = rule(() => seq(
    'import',
    JavaScript.identifier,
    '=',
    choice(JavaScript.identifier, JavaScript.nested_identifier),
    JavaScript._semicolon,
  )),

  nested_type_identifier = rule(() => prec('member', seq(
    field('module', choice(JavaScript.identifier, JavaScript.nested_identifier)),
    '.',
    field('name', _type_identifier),
  ))),

  interface_declaration = rule(() => seq(
    'interface',
    field('name', _type_identifier),
    field('type_parameters', optional(type_parameters)),
    optional(extends_type_clause),
    field('body', alias(object_type, interface_body)),
  )),

  extends_type_clause = rule(() => seq(
    'extends',
    commaSep1(field('type', choice(
      _type_identifier,
      nested_type_identifier,
      generic_type,
    ))),
  )),

  enum_declaration = rule(() => seq(
    optional('const'),
    'enum',
    field('name', JavaScript.identifier),
    field('body', enum_body),
  )),

  enum_body = rule(() => seq(
    '{',
    optional(seq(
      sepBy1(',', choice(
        field('name', JavaScript._property_name),
        enum_assignment,
      )),
      optional(','),
    )),
    '}',
  )),

  enum_assignment = rule(() => seq(
    field('name', JavaScript._property_name),
    JavaScript._initializer,
  )),

  type_alias_declaration = rule(() => seq(
    'type',
    field('name', _type_identifier),
    field('type_parameters', optional(type_parameters)),
    '=',
    field('value', type),
    JavaScript._semicolon,
  )),

  accessibility_modifier = rule(() => choice(
    'public',
    'private',
    'protected',
  )),

  override_modifier = rule(() => 'override'),

  required_parameter = rule(() => seq(
    _parameter_name,
    field('type', optional(type_annotation)),
    optional(JavaScript._initializer),
  )),

  optional_parameter = rule(() => seq(
    _parameter_name,
    '?',
    field('type', optional(type_annotation)),
    optional(JavaScript._initializer),
  )),

  _parameter_name = rule(() => seq(
    repeat(field('decorator', decorator)),
    optional(accessibility_modifier),
    optional(override_modifier),
    optional('readonly'),
    field('pattern', choice(JavaScript.pattern, JavaScript.this_)),
  )),

  omitting_type_annotation = rule(() => seq('-?:', type)),

  adding_type_annotation = rule(() => seq('+?:', type)),

  opting_type_annotation = rule(() => seq('?:', type)),

  type_annotation = rule(() => seq(
    ':',
    type,
  )),

  // Oh boy
  // The issue is these special type queries need a lower relative precedence than the normal ones,
  // since these are used in type annotations whereas the other ones are used where `typeof` is
  // required beforehand. This allows for parsing of annotations such as
  // foo: import('x').y.z;
  // but was a nightmare to get working.
  _type_query_member_expression_in_type_annotation = rule(() => seq(
    field('object', choice(
      JavaScript.import_,
      alias(_type_query_member_expression_in_type_annotation, JavaScript.member_expression),
      alias(_type_query_call_expression_in_type_annotation, call_expression),
    )),
    '.',
    field('property', choice(
      JavaScript.private_property_identifier,
      alias(JavaScript.identifier, JavaScript.property_identifier),
    )),
  )),

  _type_query_call_expression_in_type_annotation = rule(() => seq(
    field('function', choice(
      JavaScript.import_,
      alias(_type_query_member_expression_in_type_annotation, JavaScript.member_expression),
    )),
    field('arguments', JavaScript.arguments_),
  )),

  asserts = rule(() => seq(
    'asserts',
    choice(type_predicate, JavaScript.identifier, JavaScript.this_),
  )),

  asserts_annotation = rule(() => seq(
    seq(':', asserts),
  )),

  type = rule(() => choice(
    primary_type,
    function_type,
    readonly_type,
    constructor_type,
    infer_type,
    prec(-1, alias(_type_query_member_expression_in_type_annotation, JavaScript.member_expression)),
    prec(-1, alias(_type_query_call_expression_in_type_annotation, call_expression)),
  )),

  tuple_parameter = rule(() => seq(
    field('name', choice(JavaScript.identifier, JavaScript.rest_pattern)),
    field('type', type_annotation),
  )),

  optional_tuple_parameter = rule(() => seq(
    field('name', JavaScript.identifier),
    '?',
    field('type', type_annotation),
  )),

  optional_type = rule(() => seq(type, '?')),

  rest_type = rule(() => seq('...', type)),

  _tuple_type_member = rule(() => choice(
    alias(tuple_parameter, required_parameter),
    alias(optional_tuple_parameter, optional_parameter),
    optional_type,
    rest_type,
    type,
  )),

  constructor_type = rule(() => prec.left(seq(
    optional('abstract'),
    'new',
    field('type_parameters', optional(type_parameters)),
    field('parameters', JavaScript.formal_parameters),
    '=>',
    field('type', type),
  ))),

  primary_type = rule(() => choice(
    parenthesized_type,
    predefined_type,
    _type_identifier,
    nested_type_identifier,
    generic_type,
    object_type,
    array_type,
    tuple_type,
    flow_maybe_type,
    type_query,
    index_type_query,
    alias(JavaScript.this_, this_type),
    existential_type,
    literal_type,
    lookup_type,
    conditional_type,
    template_literal_type,
    intersection_type,
    union_type,
    'const',
  )),

  template_type = rule(() => seq('${', choice(primary_type, infer_type), '}')),

  template_literal_type = rule(() => seq(
    '`',
    repeat(choice(
      alias(JavaScript._template_chars, JavaScript.string_fragment),
      template_type,
    )),
    '`',
  )),

  infer_type = rule(() => prec.right(seq(
    'infer',
    _type_identifier,
    optional(seq(
      'extends',
      type,
    )),
  ))),

  conditional_type = rule(() => prec.right(seq(
    field('left', type),
    'extends',
    field('right', type),
    '?',
    field('consequence', type),
    ':',
    field('alternative', type),
  ))),

  generic_type = rule(() => prec('call', seq(
    field('name', choice(
      _type_identifier,
      nested_type_identifier,
    )),
    field('type_arguments', type_arguments),
  ))),

  type_predicate = rule(() => seq(
    field('name', choice(
      JavaScript.identifier,
      JavaScript.this_,
      // Sometimes tree-sitter contextual lexing is not good enough to know
      // that 'object' in ':object is foo' is really an identifier and not
      // a predefined_type, so we must explicitely list all possibilities.
      // TODO: should we use '_reserved_identifier'? Should all the element in
      // 'predefined_type' be added to '_reserved_identifier'?
      alias(predefined_type, JavaScript.identifier),
    )),
    'is',
    field('type', type),
  )),

  type_predicate_annotation = rule(() => seq(
    seq(':', type_predicate),
  )),

  // Type query expressions are more restrictive than regular expressions
  _type_query_member_expression = rule(() => seq(
    field('object', choice(
      JavaScript.identifier,
      JavaScript.this_,
      alias(_type_query_subscript_expression, JavaScript.subscript_expression),
      alias(_type_query_member_expression, JavaScript.member_expression),
      alias(_type_query_call_expression, call_expression),
    )),
    choice('.', '?.'),
    field('property', choice(
      JavaScript.private_property_identifier,
      alias(JavaScript.identifier, JavaScript.property_identifier),
    )),
  )),

  _type_query_subscript_expression = rule(() => seq(
    field('object', choice(
      JavaScript.identifier,
      JavaScript.this_,
      alias(_type_query_subscript_expression, JavaScript.subscript_expression),
      alias(_type_query_member_expression, JavaScript.member_expression),
      alias(_type_query_call_expression, call_expression),
    )),
    optional('?.'),
    '[', field('index', choice(predefined_type, JavaScript.string, JavaScript.number)), ']',
  )),

  _type_query_call_expression = rule(() => seq(
    field('function', choice(
      JavaScript.import_,
      JavaScript.identifier,
      alias(_type_query_member_expression, JavaScript.member_expression),
      alias(_type_query_subscript_expression, JavaScript.subscript_expression),
    )),
    field('arguments', JavaScript.arguments_),
  )),

  _type_query_instantiation_expression = rule(() => seq(
    field('function', choice(
      JavaScript.import_,
      JavaScript.identifier,
      alias(_type_query_member_expression, JavaScript.member_expression),
      alias(_type_query_subscript_expression, JavaScript.subscript_expression),
    )),
    field('type_arguments', type_arguments),
  )),

  type_query = rule(() => prec.right(seq(
    'typeof',
    choice(
      alias(_type_query_subscript_expression, JavaScript.subscript_expression),
      alias(_type_query_member_expression, JavaScript.member_expression),
      alias(_type_query_call_expression, call_expression),
      alias(_type_query_instantiation_expression, instantiation_expression),
      JavaScript.identifier,
      JavaScript.this_,
    ),
  ))),

  index_type_query = rule(() => seq(
    'keyof',
    primary_type,
  )),

  lookup_type = rule(() => seq(
    primary_type,
    '[',
    type,
    ']',
  )),

  mapped_type_clause = rule(() => seq(
    field('name', _type_identifier),
    'in',
    field('type', type),
    optional(seq('as', field('alias', type))),
  )),

  literal_type = rule(() => choice(
    alias(_number, JavaScript.unary_expression),
    JavaScript.number,
    JavaScript.string,
    JavaScript.true_,
    JavaScript.false_,
    JavaScript.null_,
    JavaScript.undefined,
  )),

  _number = rule(() => prec.left(1, seq(
    field('operator', choice('-', '+')),
    field('argument', JavaScript.number),
  ))),

  existential_type = rule(() => '*'),

  flow_maybe_type = rule(() => prec.right(seq('?', primary_type))),

  parenthesized_type = rule(() => seq('(', type, ')')),

  predefined_type = rule(() => choice(
    'any',
    'number',
    'boolean',
    'string',
    'symbol',
    alias(seq('unique', 'symbol'), 'unique symbol'),
    'void',
    'unknown',
    'string',
    'never',
    'object',
  )),

  type_arguments = rule(() => seq(
    '<',
    commaSep1(type),
    optional(','),
    '>',
  )),

  object_type = rule(() => seq(
    choice('{', '{|'),
    optional(seq(
      optional(choice(',', ';')),
      sepBy1(
        choice(',', JavaScript._semicolon),
        choice(
          export_statement,
          property_signature,
          call_signature,
          construct_signature,
          index_signature,
          method_signature,
        ),
      ),
      optional(choice(',', JavaScript._semicolon)),
    )),
    choice('}', '|}'),
  )),

  call_signature = rule(() => _call_signature),

  property_signature = rule(() => seq(
    optional(accessibility_modifier),
    optional('static'),
    optional(override_modifier),
    optional('readonly'),
    field('name', JavaScript._property_name),
    optional('?'),
    field('type', optional(type_annotation)),
  )),

  _call_signature = rule(() => seq(
    field('type_parameters', optional(type_parameters)),
    field('parameters', JavaScript.formal_parameters),
    field('return_type', optional(
      choice(type_annotation, asserts_annotation, type_predicate_annotation),
    )),
  )),

  type_parameters = rule(() => seq(
    '<', commaSep1(type_parameter), optional(','), '>',
  )),

  type_parameter = rule(() => seq(
    optional('const'),
    field('name', _type_identifier),
    field('constraint', optional(constraint)),
    field('value', optional(default_type)),
  )),

  default_type = rule(() => seq(
    '=',
    type,
  )),

  constraint = rule(() => seq(
    choice('extends', ':'),
    type,
  )),

  construct_signature = rule(() => seq(
    optional('abstract'),
    'new',
    field('type_parameters', optional(type_parameters)),
    field('parameters', JavaScript.formal_parameters),
    field('type', optional(type_annotation)),
  )),

  index_signature = rule(() => seq(
    optional(
      seq(
        field('sign', optional(choice('-', '+'))),
        'readonly',
      ),
    ),
    '[',
    choice(
      seq(
        field('name', choice(
          JavaScript.identifier,
          alias(_reserved_identifier, JavaScript.identifier),
        )),
        ':',
        field('index_type', type),
      ),
      mapped_type_clause,
    ),
    ']',
    field('type', choice(
      type_annotation,
      omitting_type_annotation,
      adding_type_annotation,
      opting_type_annotation,
    )),
  )),

  array_type = rule(() => seq(primary_type, '[', ']')),

  tuple_type = rule(() => seq(
    '[', commaSep(_tuple_type_member), optional(','), ']',
  )),

  readonly_type = rule(() => seq('readonly', type)),

  union_type = rule(() => prec.left(seq(optional(type), '|', type))),

  intersection_type = rule(() => prec.left(seq(optional(type), '&', type))),

  function_type = rule(() => prec.left(seq(
    field('type_parameters', optional(type_parameters)),
    field('parameters', JavaScript.formal_parameters),
    '=>',
    field('return_type', choice(type, asserts, type_predicate)),
  ))),

  _type_identifier = rule(() => alias(JavaScript.identifier, type_identifier)),

  _reserved_identifier = rule(() => choice(
    'declare',
    'namespace',
    'type',
    'public',
    'private',
    'protected',
    'override',
    'readonly',
    'module',
    'any',
    'number',
    'boolean',
    'string',
    'symbol',
    'export',
    'object',
    'new',
    'readonly',
    JavaScript._reserved_identifier.body(),
  )),

  _function_signature_automatic_semicolon = rule(),

  __error_recovery = rule(),

  interface_body = rule(),

  this_type = rule(),

  type_identifier = rule();

export default {
  extends: JavaScript,
  name: 'typescript_common',

  externals: JavaScript.default.externals.concat([
    _function_signature_automatic_semicolon,
    __error_recovery,
  ]),

  supertypes: JavaScript.default.supertypes.concat([
    type,
    primary_type,
  ]),

  precedences: JavaScript.default.precedences.concat([
    [
      'call',
      'instantiation',
      'unary',
      'binary',
      JavaScript.await_expression,
      JavaScript.arrow_function,
    ],
    [
      'extends',
      'instantiation',
    ],
    [
      intersection_type,
      union_type,
      conditional_type,
      function_type,
      'binary',
      type_predicate,
      readonly_type,
    ],
    [mapped_type_clause, primary_expression],
    [accessibility_modifier, primary_expression],
    ['unary_void', expression],
    [extends_clause, primary_expression],
    ['unary', 'assign'],
    ['declaration', expression],
    [predefined_type, JavaScript.unary_expression],
    [type, flow_maybe_type],
    [tuple_type, array_type, JavaScript.pattern, type],
    [readonly_type, JavaScript.pattern],
    [readonly_type, primary_expression],
    [type_query, JavaScript.subscript_expression, expression],
    [type_query, _type_query_subscript_expression],
    [nested_type_identifier, generic_type, primary_type, lookup_type, index_type_query, type],
    [as_expression, satisfies_expression, primary_type],
    [_type_query_member_expression, JavaScript.member_expression],
    [JavaScript.member_expression, _type_query_member_expression_in_type_annotation],
    [_type_query_member_expression, primary_expression],
    [_type_query_subscript_expression, JavaScript.subscript_expression],
    [_type_query_subscript_expression, primary_expression],
    [_type_query_call_expression, primary_expression],
    [_type_query_instantiation_expression, primary_expression],
    [type_query, primary_expression],
    [override_modifier, primary_expression],
    [decorator_call_expression, decorator],
    [literal_type, JavaScript.pattern],
    [predefined_type, JavaScript.pattern],
    [call_expression, _type_query_call_expression],
    [call_expression, _type_query_call_expression_in_type_annotation],
    [new_expression, primary_expression],
    [JavaScript.meta_property, primary_expression],
    [construct_signature, JavaScript._property_name],
  ]),

  conflicts: JavaScript.default.conflicts.concat([
    [call_expression, instantiation_expression, JavaScript.binary_expression],
    [call_expression, instantiation_expression, JavaScript.binary_expression, JavaScript.unary_expression],
    [call_expression, instantiation_expression, JavaScript.binary_expression, JavaScript.update_expression],
    [call_expression, instantiation_expression, JavaScript.binary_expression, JavaScript.await_expression],

    // This appears to be necessary to parse a parenthesized class expression
    [class_],

    [JavaScript.nested_identifier, nested_type_identifier, primary_expression],
    [JavaScript.nested_identifier, nested_type_identifier],

    [_call_signature, function_type],
    [_call_signature, constructor_type],

    [primary_expression, _parameter_name],
    [primary_expression, _parameter_name, primary_type],
    [primary_expression, literal_type],
    [primary_expression, literal_type, JavaScript.rest_pattern],
    [primary_expression, predefined_type, JavaScript.rest_pattern],
    [primary_expression, primary_type],
    [primary_expression, generic_type],
    [primary_expression, predefined_type],
    [primary_expression, JavaScript.pattern, primary_type],
    [_parameter_name, primary_type],
    [JavaScript.pattern, primary_type],

    [optional_tuple_parameter, primary_type],
    [JavaScript.rest_pattern, primary_type, primary_expression],

    [JavaScript.object, object_type],
    [JavaScript.object, JavaScript.object_pattern, object_type],
    [JavaScript.object, JavaScript.object_pattern, JavaScript._property_name],
    [JavaScript.object_pattern, object_type],
    [JavaScript.object_pattern, object_type],

    [JavaScript.array, tuple_type],
    [JavaScript.array, JavaScript.array_pattern, tuple_type],
    [JavaScript.array_pattern, tuple_type],

    [template_literal_type, JavaScript.template_string],
  ]),

  inline: JavaScript.default.inline
    .filter((rule) => ![
      JavaScript._formal_parameter,
      JavaScript._call_signature,
    ].includes(rule))
    .concat([
      _type_identifier,
      _jsx_start_opening_element,
    ]),
};

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return sepBy1(',', rule);
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return sepBy(',', rule);
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a separator
 *
 * @param {RuleOrLiteral} sep
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {ChoiceRule}
 */
function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}

/**
 * Creates a rule to match one or more of the rules separated by a separator
 *
 * @param {RuleOrLiteral} sep
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}
