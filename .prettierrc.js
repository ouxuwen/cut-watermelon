module.exports = {
  printWidth: 100, // 每行最大字符数
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed', // 是否要给对象的属性加引号（https://prettier.io/docs/en/options.html#quote-props）
  jsxSingleQuote: false,
  trailingComma: 'all', // 尾随逗号
  bracketSpacing: true, // 大括号和对象字面量之间是否加空格
  jsxBracketSameLine: false, // jsx 中是否把尖括号放在元素同一行
  arrowParens: 'always', // 何时在箭头函数参数加括号
  rangeStart: 0,
  rangeEnd: Infinity,
  requirePragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css', // 对 HTML 中的空格敏感程度
  endOfLine: 'auto', // 文件结尾
  embeddedLanguageFormatting: 'auto', // 是否格式化代码中的代码
};
