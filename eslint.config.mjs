import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

export default [
    js.configs.recommended,
    prettier,
    jest.configs['flat/recommended'],
    {
        languageOptions: {
            ecmaVersion: 2023,
            globals: {
                ...globals.node,
            },
            sourceType: 'module',
        },
        rules: {
            complexity: ['error', 10],
        },
    },
];
