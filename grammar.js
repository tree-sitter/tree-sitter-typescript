const PREC = {
  union: 2,
  intersection: 2,
  declaration: 1
};

module.exports = grammar(require('tree-sitter-javascript/grammar'), {
  name: 'typescript',

  conflicts: ($, previous) => previous.concat([

    // TODO - Figure out why these are needed.
    [$.required_parameter, $.assignment],
    [$.required_parameter, $._expression],
    [$.required_parameter, $._primary_type],

    // ( foo ) =>
    // ( foo )
    //   ^-- parenthesized expression or arrow function?
    [$._expression, $.required_parameter, $.required_string_parameter],

    // ( foo ? )
    //       ^-- ternary or optional parameter?
    [$._expression, $.optional_parameter, $.optional_string_parameter],

    [$.method_signature, $.method_definition, $._expression],

    [$._expression, $._type_member, $.method_signature],

    // parenthesized_type starting with object type or function type starting with a destructuring pattern?
    [$._expression, $._primary_type],

    [$._expression, $._primary_type, $.qualified_type_name],

    [$._expression, $.qualified_type_name],

    [$._expression, $.required_parameter, $._primary_type],

    [$._expression, $.property_signature],

    [$._expression, $.property_signature, $.method_signature],

    [$._expression, $.property_signature, $._property_definition_list],

    [$.property_signature, $._property_definition_list],

    // < Type >
    //       ^ jsx_opening_element or type_parameter?
    [$.jsx_opening_element, $.type_parameter],

    [$.this_type, $.this_expression],
    [$._type, $.array_type]
  ]),
  rules: {

    // Overrides

    // Override import and export to support Flow 'import type' statements
    import_statement: ($, previous) => seq(
      'import',
      optional(choice('type', 'typeof')),
      choice(
        seq($.import_clause, $._from_clause),
        $.string
      ),
      terminator()
    ),

    variable_declarator: ($, previous) => seq(
      pattern($),
      optional($.type_annotation),
      optional(seq(
        '=',
        $._expression
      ))
    ),

    _paren_expression: ($, previous) => seq(
      '(', choice(seq($._expression, optional($.type_annotation)), $.comma_op), ')'
    ),

    formal_parameters: ($, previous) => seq(
      '(',
      commaSep($._parameter),
      ')'
    ),

    function: ($, previous) => seq(
      optional('async'),
      'function',
      optional($.identifier),
      $.call_signature,
      $.statement_block
    ),

    method_definition: $ => seq(
      optional('async'),
      optional(choice('get', 'set', '*')),
      choice($.identifier, $.reserved_identifier),
      $.call_signature,
      $.statement_block
    ),

    // A function, generator, class, or variable declaration
    _declaration: ($, previous) => prec(PREC.declaration, choice(
      $.function,
      $.generator_function,
      $.class,
      $.variable_declaration,
      $.type_alias_declaration,
      $.enum_declaration,
      $.interface_declaration
    )),


    // Additions

    interface_declaration: $ => seq(
      'interface',
      $.identifier,
      optional($.type_parameters),
      optional($.interface_extends_clause),
      $.object_type
    ),

    interface_extends_clause: $ => seq(
      'extends',
      sepBy1(',', type_reference($))
    ),

    enum_declaration: $ => seq(
      optional('const'),
      'enum',
      $.identifier,
      '{',
      optional($._enum_body),
      '}'
    ),

    _enum_body: $ => seq(
      seq(sepBy1(',', $._enum_member), optional(','))
    ),

    _enum_member: $ => choice(
      // TODO this should be a PropertyName
      $.identifier,
      $.enum_assignment
    ),

    enum_assignment: $ => seq(
      $.identifier,
      $._initializer
    ),

    type_alias_declaration: $ => seq(
      'type',
      $.identifier,
      optional($.type_parameters),
      '=',
      $._type,
      terminator()
    ),

    _accessibility_modifier: $ => choice(
      'public',
      'private',
      'protected'
    ),

    _parameter: $ => choice(
      $.required_parameter,
      $.rest_parameter,
      $.optional_parameter,
      $.required_string_parameter,
      $.optional_string_parameter
    ),

    required_parameter: $ => choice(
      seq(
        optional($._accessibility_modifier),
        pattern($),
        optional($.type_annotation)),
      seq(
        optional($._accessibility_modifier),
        pattern($),
        optional($.type_annotation),
        $._initializer)
    ),

    required_string_parameter: $ => seq($.identifier, ':', $.string),

    optional_parameter: $ => choice(
      seq(
        optional($._accessibility_modifier),
        pattern($),
        '?',
        optional($.type_annotation)),
      seq(
        optional($._accessibility_modifier),
        pattern($),
        '?',
        optional($.type_annotation),
        $._initializer)
    ),

    optional_string_parameter: $ => seq($.identifier, '?', ':', $.string),

    rest_parameter: $ => seq(
      '...',
      $.identifier,
      optional($.type_annotation)
    ),

    type_annotation: $ => seq(
      ':', $._type
    ),

    _type: $ => choice(
      $._primary_type,
      $.union_type,
      $.intersection_type,
      $.function_type,
      $.constructor_type
    ),

    constructor_type: $ => seq(
      'new',
      optional($.type_parameters),
      $.formal_parameters,
      '=>',
      $._type
    ),

    _primary_type: $ => choice(
      $.parenthesized_type,
      $.predefined_type,
      type_reference($),
      $.object_type,
      $.array_type,
      $.tuple_type,
      $.flow_maybe_type,
      // $.type_query,
      $.this_type,
      $.existential_type
    ),

    existential_type: $ => '*',

    this_type: $ => 'this',

    flow_maybe_type: $ => prec.right(seq( '?', $._primary_type )),

    parenthesized_type: $ => seq(
      '(', $._type, ')'
    ),

    predefined_type: $ => choice(
      'any',
      'number',
      'boolean',
      'string',
      'symbol',
      'void'
    ),

    type_arguments: $ => seq(
      '<', commaSep1($._type), '>'
    ),

    qualified_type_name: $ => choice(
      seq(type_reference($), '.', $.identifier)
    ),

    object_type: $ => seq(
      '{', optional($._type_body), '}'
    ),

    _type_body: $ => choice(
      $._type_member,
      seq(sepBy1(choice(',',';'), $._type_member), optional(choice(',',';')))
    ),

    _type_member: $ => prec.right(choice(
      $.property_signature,
      $.call_signature,
      $.construct_signature,
      $.index_signature,
      $.method_signature
    )),

    property_signature: $ => seq($.identifier, optional('?'), optional($.type_annotation)),

    call_signature: $ => seq(
      optional($.type_parameters),
      $.formal_parameters,
      optional($.type_annotation)
    ),

    type_parameters: $ => seq(
      '<', commaSep1($.type_parameter), '>'
    ),

    type_parameter: $ => seq(
      $.identifier,
      optional($.constraint)
    ),

    constraint: $ => seq(
      'extends', $._type
    ),

    construct_signature: $ => seq(
      'new',
      optional($.type_parameters),
      $.formal_parameters,
      optional($.type_annotation)
    ),

    index_signature: $ => choice(
      seq('[', $.identifier, ':', 'string', ']', $.type_annotation),
      seq('[', $.identifier, ':', 'number', ']', $.type_annotation)
    ),

    method_signature: $ => seq(
      $.identifier, optional('?'), $.call_signature
    ),

    array_type: $ => seq(
      $._primary_type, '[', ']'
    ),

    tuple_type: $ => seq(
      '[', commaSep1($._type), ']'
    ),

    union_type: $ => prec.left(PREC.union, seq(
      $._type, '|', $._type
    )),

    intersection_type: $ => prec.left(PREC.intersection, seq(
      $._type, '&', $._type
    )),

    function_type: $ => seq(
      optional($.type_parameters),
      $.formal_parameters,
      '=>',
      $._type
    )
  }
});

function commaSep1 (rule) {
  return sepBy1(',', rule);
}

function commaSep (rule) {
  return optional(commaSep1(rule));
}

function sepBy1 (sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

function sepBy (sep, rule) {
  return optional(sepBy1(sep, rule));
}

function pattern ($) {
  return choice($.identifier, $.assignment_pattern)
}

function type_reference($) {
    return seq(
      choice($.identifier, $.qualified_type_name),
      optional($.type_arguments)
    )
}

function terminator () {
  return choice(';', sym('_line_break'));
}
