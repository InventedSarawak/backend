import { ESLint } from 'eslint'

export default [
    {
        ignores: ['dist', 'node_modules'],

        languageOptions: {
            ecmaVersion: 12,
            sourceType: 'module',
            parser: '@typescript-eslint/parser'
        },

        linterOptions: {
            env: {
                browser: true,
                es2021: true,
                node: true,
                mocha: true
            },
            extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:mocha/recommended'],
            plugins: ['@typescript-eslint', 'mocha'],
            rules: {
                'no-shadow': 'off',
                '@typescript-eslint/no-shadow': 'error',
                'no-use-before-define': 'off',
                '@typescript-eslint/no-use-before-define': 'error',
                semi: ['error', 'never'],
                quotes: ['error', 'single'],
                indent: ['error', 4],
                trailingComma: ['error', 'none'],
                bracketSpacing: ['error', true]
            }
        }
    }
]

// changes