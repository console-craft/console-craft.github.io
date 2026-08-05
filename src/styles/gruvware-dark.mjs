const gruvwareDark = {
  name: "gruvware-dark",
  type: /** @type {'dark'} */ ("dark"),
  bg: "#2a2928",
  fg: "#d4be98",
  colors: {
    "editor.background": "#2a2928",
    "editor.foreground": "#d4be98",
    "editorLineNumber.foreground": "#695e55",
    "editorCursor.foreground": "#e6d5ae",
    "editor.selectionBackground": "#3b3634",
    "editor.lineHighlightBackground": "#33302e",
    "gitDecoration.addedResourceForeground": "#add400",
    "gitDecoration.deletedResourceForeground": "#545e2c",
    "gitDecoration.modifiedResourceForeground": "#b2ba8e",
  },
  settings: [
    // base
    {
      settings: {
        foreground: "#d4be98",
        background: "#2a2928",
      },
    },
    // comments, docs, shebangs
    {
      scope: [
        "comment",
        "punctuation.definition.comment",
        "comment.block",
        "comment.line",
        "comment.block.documentation",
        "comment.line.documentation",
        "meta.documentation",
        "punctuation.definition.documentation",
      ],
      settings: { foreground: "#7c6f64" },
    },
    // strings
    {
      scope: ["string", "punctuation.definition.string", "string.quoted", "string.template"],
      settings: { foreground: "#bac584" },
    },
    // numbers, booleans, null
    {
      scope: [
        "constant.numeric",
        "constant.numeric.integer",
        "constant.numeric.float",
        "constant.numeric.hex",
        "constant.language.boolean",
        "constant.language.null",
        "constant.language.undefined",
        "constant.language.nan",
        "constant.language.infinity",
      ],
      settings: { foreground: "#de9880" },
    },
    // escape sequences, regex specials, paths, urls
    {
      scope: [
        "constant.character.escape",
        "constant.other.escape",
        "string.regexp",
        "string.quoted.other.literal",
        "string.other.link",
        "string.other.path",
        "string.other.url",
        "punctuation.definition.string.begin",
        "punctuation.definition.string.end",
      ],
      settings: { foreground: "#d4be98" },
    },
    // constants, enum members
    {
      scope: [
        "variable.other.constant",
        "support.constant",
        "constant.other",
        "entity.name.constant",
        "meta.definition.variable.constant",
        "meta.enum",
        "meta.enum constant.other",
      ],
      settings: { foreground: "#d6b37b" },
    },
    // variables, identifiers, constructors, "new"
    {
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "variable.language",
        "identifier",
        "meta.definition.variable",
        "keyword.operator.new",
        "keyword.other.new",
        "support.function.constructor",
        "meta.instance.constructor",
      ],
      settings: { foreground: "#d6b37b" },
    },
    // properties, member fields
    {
      scope: ["variable.other.property", "variable.other.member", "support.variable.property", "support.variable"],
      settings: { foreground: "#d4be98" },
    },
    // keywords
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.control.conditional",
        "keyword.control.loop",
        "keyword.operator",
        "keyword.other",
        "storage.modifier",
        "storage",
        "storage.type",
      ],
      settings: { foreground: "#d4be98" },
    },
    // return, async, imports, includes, preproc, coroutines
    {
      scope: [
        "keyword.control.import",
        "keyword.control.export",
        "keyword.control.from",
        "keyword.control.using",
        "keyword.control.directive",
        "keyword.control.flow",
        "storage.modifier.async",
        "meta.preprocessor",
        "keyword.other.directive",
        "punctuation.definition.directive",
      ],
      settings: { foreground: "#d4a599" },
    },
    // function and method calls
    {
      scope: [
        "entity.name.function",
        "entity.name.function.member",
        "entity.name.function.method",
        "support.function",
        "support.function.any-method",
        "support.function.builtin",
        "variable.function",
        "meta.function-call entity.name.function",
        "meta.function-call variable.function",
        "meta.method-call entity.name.function",
        "meta.method-call variable.function",
        "meta.function-call support.function",
        "meta.method-call support.function",
      ],
      settings: { foreground: "#b2ba8e" },
    },
    // function and method definitions
    {
      scope: [
        "meta.function entity.name.function",
        "meta.function.declaration entity.name.function",
        "meta.function.definition entity.name.function",
        "meta.function.expression entity.name.function",
        "meta.method entity.name.function",
        // "meta.method.declaration entity.name.function",
        "meta.definition.method entity.name.function",
        "meta.class meta.method entity.name.function",
        "meta.class meta.definition.method entity.name.function",
      ],
      settings: { foreground: "#adb79d", fontStyle: "bold" },
    },
    // decorators, annotations
    {
      scope: [
        "meta.decorator",
        "meta.annotation",
        "punctuation.definition.decorator",
        "entity.name.function.decorator",
      ],
      settings: { foreground: "#adb79d", fontStyle: "bold" },
    },
    // types
    {
      scope: [
        "entity.name.type",
        "support.type",
        "support.class",
        "entity.name.class",
        "entity.name.struct",
        "entity.name.interface",
        "entity.name.enum",
        "meta.type",
      ],
      settings: { foreground: "#e6d5ae" },
    },
    // special
    {
      scope: [
        "support",
        "support.other",
        "meta.interpolation",
        "punctuation.section.interpolation",
        "punctuation.definition.interpolation",
        "punctuation.special",
      ],
      settings: { foreground: "#b2ba8e" },
    },
    // punctuation, delimiters, brackets
    {
      scope: [
        "punctuation.separator",
        "punctuation.terminator",
        "punctuation.definition.parameters",
        "punctuation.definition.arguments",
        "punctuation.definition.array",
        "punctuation.definition.object",
        "punctuation.definition.block",
        "punctuation.definition.tag",
        "punctuation.definition.template-expression",
        "meta.brace",
      ],
      settings: { foreground: "#ca9a70" },
    },
    // brackets
    {
      scope: [
        "punctuation.section.group.begin",
        "punctuation.section.group.end",
        "punctuation.section.brackets.begin",
        "punctuation.section.brackets.end",
        "punctuation.section.block.begin",
        "punctuation.section.block.end",
      ],
      settings: { foreground: "#d6b37b" },
    },

    // markdown
    {
      scope: ["heading.1.markdown"],
      settings: { foreground: "#d4a599", fontStyle: "bold" },
    },
    {
      scope: ["heading.2.markdown"],
      settings: { foreground: "#eead83", fontStyle: "bold" },
    },
    {
      scope: ["heading.3.markdown"],
      settings: { foreground: "#de9880", fontStyle: "bold" },
    },
    {
      scope: ["heading.4.markdown"],
      settings: { foreground: "#d6b37b", fontStyle: "bold" },
    },
    {
      scope: ["heading.5.markdown"],
      settings: { foreground: "#d6b37b", fontStyle: "bold" },
    },
    {
      scope: ["heading.6.markdown"],
      settings: { foreground: "#d6b37b", fontStyle: "bold" },
    },
    {
      scope: ["markup.bold.markdown", "punctuation.definition.bold.markdown"],
      settings: { fontStyle: "bold" },
    },
    {
      scope: ["markup.italic.markdown", "punctuation.definition.italic.markdown"],
      settings: { fontStyle: "italic" },
    },
    {
      scope: ["markup.strikethrough.markdown", "punctuation.definition.strikethrough.markdown"],
      settings: { fontStyle: "strikethrough" },
    },
    {
      scope: ["markup.inline.raw.string.markdown", "punctuation.definition.raw.markdown"],
      settings: { foreground: "#bac584", background: "#3b3634" },
    },
    {
      scope: ["markup.fenced_code.block.markdown"],
      settings: { background: "#3b3634" },
    },
    {
      scope: ["punctuation.definition.markdown", "fenced_code.block.language.markdown"],
      settings: { foreground: "#d4be98", background: "#3b3634" },
    },
    {
      scope: ["punctuation.definition.list.begin.markdown"],
      settings: { foreground: "#ca9a70" },
    },
    {
      scope: ["punctuation.definition.quote.begin.markdown"],
      settings: { foreground: "#4c4641" },
    },
    {
      scope: ["markup.quote.markdown"],
      settings: { foreground: "#695e55" },
    },
    {
      scope: ["markup.table.markdown"],
      settings: { foreground: "#695e55" },
    },
    {
      scope: ["punctuation.separator.table.markdown"],
      settings: { foreground: "#4c4641" },
    },
    {
      scope: ["string.other.link.title.markdown", "markup.underline.link.markdown"],
      settings: { foreground: "#adb79d" },
    },

    // markup, HTML, JSX tags
    {
      scope: ["entity.name.tag"],
      settings: { foreground: "#d4be98" },
    },
    {
      scope: ["support.class.component"],
      settings: { foreground: "#ca9a70" },
    },
    {
      scope: ["entity.other.attribute-name", "meta.attribute"],
      settings: { foreground: "#d4be98" },
    },
    // diffs
    {
      scope: ["markup.inserted", "meta.diff.header.to-file"],
      settings: { foreground: "NONE", background: "#51592a" },
    },
    {
      scope: ["markup.deleted", "meta.diff.header.from-file"],
      settings: { foreground: "#695e55", background: "#373a20" },
    },
    {
      scope: ["markup.changed"],
      settings: { foreground: "#695e55", background: "#414526" },
    },
    // errors, invalid
    {
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: "#2a2928", background: "#ea6962" },
    },
  ],
}

export default gruvwareDark
