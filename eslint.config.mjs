import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    prettier,
    jest.configs['flat/recommended'],
    {
        languageOptions: {
            ecmaVersion: 2023,
            globals: {
                ...globals.node,
            },
            sourceType: 'module',
            parserOptions: {
                project: 'tsconfig.test.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            complexity: ['error', 10],
        },
    },
);
