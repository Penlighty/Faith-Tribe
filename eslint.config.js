import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/design/tokens/**',
      'src/design/tribes/**',
      'src/design/icons/**',
      'public/**',
      'faith-tribe-icons/**'
    ]
  },
  {
    files: ['src/design/components/**/*.{ts,tsx}', 'tests/fixtures/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message: 'Raw hex color literals are forbidden outside src/design/tokens and src/design/tribes. Use CSS variables or design tokens.'
        },
        {
          selector: "Literal[value=/^(rgb|rgba|hsl|hsla)\\(/i]",
          message: 'Raw rgb/rgba/hsl/hsla color literals are forbidden outside src/design/tokens and src/design/tribes. Use CSS variables or design tokens.'
        },
        {
          selector: "TemplateElement[value.raw=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message: 'Raw hex color literals in template strings are forbidden. Use CSS variables or design tokens.'
        }
      ]
    }
  }
];
